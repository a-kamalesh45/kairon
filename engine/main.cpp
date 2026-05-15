#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <sstream>
#include "SimpleRedis.hpp"
#include <windows.h>
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

    while (running)
    {
        std::string payload = redis.consume("orders:" + symbol);
        if (payload.empty()) continue;

        // === THE KILL-SWITCH INTERCEPT ===
        if (payload == "RESYNC") {
            std::cout << "\n\033[41m\033[37m 🚨 REALITY RESYNC TRIGGERED FOR " << symbol << " 🚨 \033[0m\n" << std::endl;
            kairon.triggerResync(symbol);
            continue;
        }

        try
        {
            std::stringstream ss(payload);
            std::string segment;
            std::vector<std::string> parts;

            while (std::getline(ss, segment, ','))
            {
                parts.push_back(segment);
            }

            if (parts.size() >= 4)
            {
                long long id = std::stoll(parts[0]);
                long long qty = std::stoll(parts[1]);
                double priceRaw = std::stod(parts[2]) / 10000.0;
                bool isBuy = (parts[3] == "1");
                
                bool isUI = (parts.size() == 5 && parts[4] == "1");

                Order newOrder(id, qty, priceRaw, isBuy);

                kairon.placeOrder(symbol, newOrder, isUI);

                std::vector<std::string> trades = kairon.getBroadcasts(symbol);
                for (const auto &json : trades)
                {
                    redis.publish("trade-updates", json);
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

    std::vector<HANDLE> threads;
    for (size_t i = 0; i < ACTIVE_ASSETS.size(); i++)
    {
        std::string *threadSymbol = new std::string(ACTIVE_ASSETS[i]);
        HANDLE hThread = CreateThread(NULL, 0, redisConsumerLoop, (LPVOID)threadSymbol, 0, NULL);
        threads.push_back(hThread);
    }

    Sleep(1000);

    while (true)
    {
        // MUTED: Stop wiping the screen so we can read the logs!
        // system("cls");
        
        // MUTED: Stop printing the dashboard loop so the UI logs aren't swallowed
        /*
        std::cout << "=========================================" << std::endl;
        std::cout << "       KAIRON ISOLATED STATE ENGINE      " << std::endl;
        std::cout << "=========================================" << std::endl;
        for (const auto &sym : ACTIVE_ASSETS) { ... }
        std::cout << "=========================================" << std::endl;
        */

        Sleep(1500);
    }

    return 0;
}