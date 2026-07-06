#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <iomanip>
#include <sstream>
#include <windows.h>
#include "SimpleRedis.hpp"
#include "OrderBook.hpp"

std::vector<std::string> ACTIVE_ASSETS = {"BTC", "ETH", "BNB", "SOL", "DOGE", "LINK", "XRP", "LTC"};

class Exchange
{
public:
    std::map<std::string, OrderBook> orderBooks;

    void placeOrder(std::string symbol, Order order, bool isUI)
    {
        orderBooks[symbol].addOrder(order, symbol, isUI);
    }

    Ticker getMarketData(std::string symbol)
    {
        return orderBooks[symbol].getTicker();
    }

    std::vector<std::string> getBroadcasts(std::string symbol)
    {
        return orderBooks[symbol].flushTrades();
    }

    void triggerResync(std::string symbol)
    {
        orderBooks[symbol].resyncToWorld();
    }
};

Exchange kairon;
bool running = true;

// Reverted to Windows Native Threading to support your local MinGW compiler
DWORD WINAPI redisConsumerLoop(LPVOID lpParam)
{
    std::string *symPtr = reinterpret_cast<std::string *>(lpParam);
    std::string symbol = *symPtr;
    SimpleRedis redis("127.0.0.1", 6379);

    if (!redis.connect())
    {
        std::cout << "\033[31m[FATAL] Thread " << symbol << " failed to connect to Redis!\033[0m" << std::endl;
        delete symPtr;
        return 1;
    }

    std::cout << "\033[32m[THREAD-BOOT] Engine core online for " << symbol << "\033[0m" << std::endl;

    int localTradeCounter = 0;

    while (running)
    {
        std::string payload = redis.consume("orders:" + symbol);
        if (payload.empty()) continue;

        if (payload == "RESYNC")
        {
            std::cout << "\n\033[41m\033[37m 🚨 REALITY RESYNC TRIGGERED FOR " << symbol << " 🚨 \033[0m\n" << std::endl;
            kairon.triggerResync(symbol);
            continue;
        }

        try
        {
            std::vector<std::string> parts;
            std::stringstream ss(payload);
            std::string item;
            while (std::getline(ss, item, ',')) parts.push_back(item);

            if (parts.size() >= 6)
            {
                long long id = std::stoll(parts[0]); // Binance Timestamp (ms)
                long long qty = std::stoll(parts[1]);
                double priceRaw = std::stod(parts[2]) / 10000.0;
                bool isBuy = (parts[3] == "1");
                bool isUI = (parts[4] == "1");
                std::string userId = parts[5]; 

                Order newOrder(id, qty, priceRaw, isBuy, userId);
                kairon.placeOrder(symbol, newOrder, isUI);

                // 1. Broadcast Local Executions (If your UI order matched)
                std::vector<std::string> trades = kairon.getBroadcasts(symbol);
                for (const auto &json : trades)
                {
                    redis.publish("trade-updates", json);
                }

                // 2. 🚀 THE FIX: Forward the Global Binance Tick!
                // If it came from Binance, forward the raw tick to unfreeze the Next.js UI
                if (!isUI) 
                {
                    std::stringstream tickJson;
                    tickJson << std::fixed << std::setprecision(4);
                    tickJson << "{\"type\":\"trade\","
                             << "\"symbol\":\"" << symbol << "\","
                             << "\"price\":" << priceRaw << ","
                             << "\"qty\":" << (qty / 10000.0) << ","
                             << "\"side\":\"" << (isBuy ? "buy" : "sell") << "\","
                             << "\"timestamp\":" << id << ","
                             << "\"time\":\"" << id << "\","
                             << "\"user\":\"BINANCE\"}";
                    
                    redis.publish("trade-updates", tickJson.str());
                }

                // 3. Broadcast Real Order Book Depth
                if (++localTradeCounter % 50 == 0 || isUI) 
                {
                    std::string depthJson = kairon.orderBooks[symbol].getDepthSnapshot(symbol);
                    redis.publish("trade-updates", depthJson);
                }
            }
        }
        catch (...)
        {
            // Ignore malformed data silently
        }
    }
    
    delete symPtr;
    return 0;
}

int main()
{
    std::cout << "=== KAIRON MULTI-CORE ENGINE INITIALIZING ===" << std::endl;

    for (const auto &sym : ACTIVE_ASSETS)
    {
        kairon.orderBooks[sym] = OrderBook();
    }

    // Windows native thread creation
    std::vector<HANDLE> threads;
    for (size_t i = 0; i < ACTIVE_ASSETS.size(); i++)
    {
        std::string *threadSymbol = new std::string(ACTIVE_ASSETS[i]);
        HANDLE hThread = CreateThread(NULL, 0, redisConsumerLoop, (LPVOID)threadSymbol, 0, NULL);
        threads.push_back(hThread);
    }

    Sleep(1000);
    std::cout << "=== ENGINE RUNNING: NATIVE OS WORKER THREADS DEPLOYED ===" << std::endl;

    while (true)
    {
        Sleep(1500);
    }

    return 0;
}