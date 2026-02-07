#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <sstream>
#include <windows.h> 
#include "OrderBook.hpp"
#include "SimpleRedis.hpp"

// --- THE ENGINE ---
class Exchange {
public:
    std::map<std::string, OrderBook> orderBooks;

    void placeOrder(std::string symbol, Order order) {
        orderBooks[symbol].addOrder(order, symbol);
    }

    Ticker getMarketData(std::string symbol) {
        return orderBooks[symbol].getTicker();
    }

    // New helper to get broadcasts
    std::vector<std::string> getBroadcasts(std::string symbol) {
        return orderBooks[symbol].flushTrades();
    }
};

Exchange kairon;
bool running = true;

// --- THE CONSUMER THREAD ---
DWORD WINAPI redisConsumerLoop(LPVOID lpParam) {
    std::string symbol = "BTC"; 
    SimpleRedis redis("127.0.0.1", 6379);
    
    std::cout << "[REDIS-THREAD] Connecting..." << std::endl;
    if (!redis.connect()) return 1;
    std::cout << "[REDIS-THREAD] Connected! Engine Ready." << std::endl;

    while (running) {
        std::string payload = redis.consume("orders:" + symbol);
        if (payload.empty()) continue;

        try {
            std::stringstream ss(payload);
            std::string segment;
            std::vector<std::string> parts;
            while (std::getline(ss, segment, ',')) parts.push_back(segment);

            if (parts.size() == 4) {
                long long id = std::stoll(parts[0]);
                long long qty = std::stoll(parts[1]);
                double priceRaw = std::stod(parts[2]) / 10000.0;
                bool isBuy = (parts[3] == "1");

                Order newOrder(id, qty, priceRaw, isBuy);
                
                // 1. PLACE ORDER
                kairon.placeOrder(symbol, newOrder);

                // 2. CHECK FOR MATCHES & PUBLISH TO UI
                std::vector<std::string> trades = kairon.getBroadcasts(symbol);
                for (const auto& json : trades) {
                    redis.publish("trade-updates", json);
                    std::cout << "[MATCH] Trade Published!" << std::endl;
                }
            }
        } catch (...) {}
    }
    return 0;
}

int main() {
    std::cout << "=== KAIRON ENGINE ONLINE (Win32 API Mode) ===" << std::endl;
    HANDLE hThread = CreateThread(NULL, 0, redisConsumerLoop, NULL, 0, NULL);

    while (true) {
        std::cin.get(); 
        Ticker t = kairon.getMarketData("BTC");
        system("cls"); 
        std::cout << "--- KAIRON LIVE MONITOR (BTC) ---" << std::endl;
        std::cout << "LTP:    $" << (t.lastPrice / 100000.0) << std::endl; // Note: Scaled by 100k
        std::cout << "BID:    $" << (t.bestBid / 100000.0) << std::endl;
        std::cout << "ASK:    $" << (t.bestAsk / 100000.0) << std::endl;
        std::cout << "[Enter] Refresh" << std::endl;
    }
    CloseHandle(hThread);
    return 0;
}