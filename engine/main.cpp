#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <sstream>
#include "SimpleRedis.hpp"
#include <windows.h>
#include "OrderBook.hpp"

// --- CONFIGURATION ---
// Add any assets here to instantly spawn a new dedicated matching thread for it.
// --- CONFIGURATION ---
// Spawn exactly 8 dedicated CPU threads for these assets
std::vector<std::string> ACTIVE_ASSETS = {"BTC", "ETH", "BNB", "SOL", "DOGE", "LINK", "XRP", "LTC"};
// --- THE ENGINE ---
class Exchange
{
public:
    std::map<std::string, OrderBook> orderBooks;

    void placeOrder(std::string symbol, Order order)
    {
        orderBooks[symbol].addOrder(order, symbol);
    }

    Ticker getMarketData(std::string symbol)
    {
        return orderBooks[symbol].getTicker();
    }

    std::vector<std::string> getBroadcasts(std::string symbol)
    {
        return orderBooks[symbol].flushTrades();
    }
};

Exchange kairon;
bool running = true;

// --- THE WORKER THREAD (One spawned per asset) ---
DWORD WINAPI redisConsumerLoop(LPVOID lpParam)
{
    // Safely cast the void pointer back to a heap-allocated string pointer
    std::string *symPtr = reinterpret_cast<std::string *>(lpParam);
    std::string symbol = *symPtr;
    SimpleRedis redis("127.0.0.1", 6379);

    if (!redis.connect())
    {
        std::cout << "\033[31m[FATAL] Thread " << symbol << " failed to connect to Redis!\033[0m" << std::endl;
        delete symPtr; // free the heap allocation for this thread
        return 1;
    }

    std::cout << "\033[32m[THREAD-BOOT] Engine core online for " << symbol << "\033[0m" << std::endl;

    while (running)
    {
        std::string payload = redis.consume("orders:" + symbol);
        if (payload.empty())
            continue;

        try
        {
            std::stringstream ss(payload);
            std::string segment;
            std::vector<std::string> parts;

            while (std::getline(ss, segment, ','))
            {
                parts.push_back(segment);
            }

            if (parts.size() == 4)
            {
                long long id = std::stoll(parts[0]);
                long long qty = std::stoll(parts[1]);
                double priceRaw = std::stod(parts[2]) / 10000.0;
                bool isBuy = (parts[3] == "1");

                Order newOrder(id, qty, priceRaw, isBuy);

                // 1. Execute Math
                kairon.placeOrder(symbol, newOrder);

                // 2. Broadcast JSON
                std::vector<std::string> trades = kairon.getBroadcasts(symbol);
                for (const auto &json : trades)
                {
                    redis.publish("trade-updates", json);
                }
            }
        }
        catch (...)
        {
            // Ignore malformed data silently to prevent engine stalling
        }
    }
    // Clean up the heap-allocated symbol string we created in main()
    delete symPtr;
    return 0;
}

// --- MAIN ORCHESTRATOR ---
int main()
{
    std::cout << "=== KAIRON MULTI-CORE ENGINE INITIALIZING ===" << std::endl;

    // 1. PRE-ALLOCATION (Memory Safety)
    // We must build the map keys on the main thread BEFORE workers start.
    for (const auto &sym : ACTIVE_ASSETS)
    {
        kairon.orderBooks[sym] = OrderBook();
    }

    // 2. SPAWN WORKER THREADS
    std::vector<HANDLE> threads;
    for (size_t i = 0; i < ACTIVE_ASSETS.size(); i++)
    {
        // Create a heap-allocated copy of the symbol for the thread to own
        std::string *threadSymbol = new std::string(ACTIVE_ASSETS[i]);
        HANDLE hThread = CreateThread(NULL, 0, redisConsumerLoop, (LPVOID)threadSymbol, 0, NULL);
        threads.push_back(hThread);
    }

    // Give threads 1 second to establish Redis connections
    Sleep(1000);

    // 3. THE DASHBOARD UI LOOP
    while (true)
    {
        system("cls");
        std::cout << "=========================================" << std::endl;
        std::cout << "       KAIRON DARK POOL | LIVE FEED      " << std::endl;
        std::cout << "=========================================" << std::endl;

        for (const auto &sym : ACTIVE_ASSETS)
        {
            Ticker t = kairon.getMarketData(sym);
            if (t.lastPrice > 0)
            { // Only print if trades have occurred
                std::cout << "[" << sym << "] "
                          << " LTP: $" << (t.lastPrice / 10000.0)
                          << " | SPREAD: $" << (t.spread / 10000.0)
                          << std::endl;
            }
            else
            {
                std::cout << "[" << sym << "]  Awaiting Liquidity..." << std::endl;
            }
        }

        std::cout << "=========================================" << std::endl;

        // Auto-refresh the terminal every 1.5 seconds instead of waiting for a key press
        Sleep(1500);
    }

    return 0;
}