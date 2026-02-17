#include <iostream>
#include <map>
#include <string>
#include <vector>
#include <sstream>
#include "SimpleRedis.hpp" 
#include <windows.h> 
#include "OrderBook.hpp"

// --- THE ENGINE ---
class Exchange {
public:
    std::map<std::string, OrderBook> orderBooks;

    void placeOrder(std::string symbol, Order order) {
        // Pass symbol so OrderBook knows what to put in the JSON
        orderBooks[symbol].addOrder(order, symbol);
    }

    Ticker getMarketData(std::string symbol) {
        return orderBooks[symbol].getTicker();
    }

    // === NEW: Wrapper to get pending messages from OrderBook ===
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
    
    std::cout << "[REDIS-THREAD] Connecting to Redis for " << symbol << "..." << std::endl;
    if (!redis.connect()) {
        std::cout << "[FATAL] Could not connect to Redis!" << std::endl;
        return 1;
    }
    std::cout << "[REDIS-THREAD] Connected! Engine Ready." << std::endl;

    while (running) {
        // 1. Consume Order
        std::string payload = redis.consume("orders:" + symbol);
        
        if (payload.empty()) continue;

        try {
            std::stringstream ss(payload);
            std::string segment;
            std::vector<std::string> parts;
            
            while (std::getline(ss, segment, ',')) {
                parts.push_back(segment);
            }

            if (parts.size() == 4) {
                long long id = std::stoll(parts[0]);
                long long qty = std::stoll(parts[1]);
                double priceRaw = std::stod(parts[2]) / 10000.0;
                bool isBuy = (parts[3] == "1");

                Order newOrder(id, qty, priceRaw, isBuy);
                
                // 2. Execute Order
                kairon.placeOrder(symbol, newOrder);

                // 3. CHECK FOR MATCHES & PUBLISH TO UI
                // This is where the Engine becomes "Active"
                std::vector<std::string> trades = kairon.getBroadcasts(symbol);
                for (const auto& json : trades) {
                    redis.publish("trade-updates", json);
                    std::cout << "[MATCH] Trade Executed & Published!" << std::endl;
                }
            }
        } catch (...) {
            // Ignore malformed data
        }
    }
    return 0;
}

// --- MAIN THREAD (UI) ---
int main() {
    std::cout << "=== KAIRON ENGINE ONLINE (Win32 API Mode) ===" << std::endl;

    HANDLE hThread = CreateThread(NULL, 0, redisConsumerLoop, NULL, 0, NULL);

    if (hThread == NULL) {
        std::cout << "Failed to create background thread!" << std::endl;
        return 1;
    }

    // UI LOOP
    while (true) {
        std::cin.get(); // Wait for user to press ENTER
        
        Ticker t = kairon.getMarketData("BTC");
        
        system("cls"); 
        
        std::cout << "--- KAIRON LIVE MONITOR (BTC) ---" << std::endl;
        std::cout << "LTP:    $" << (t.lastPrice / 10000.0) << std::endl;
        std::cout << "BID:    $" << (t.bestBid / 10000.0) << std::endl;
        std::cout << "ASK:    $" << (t.bestAsk / 10000.0) << std::endl;
        std::cout << "SPREAD: $" << (t.spread / 10000.0) << std::endl;
        std::cout << "---------------------------------" << std::endl;
        std::cout << "[Press ENTER to refresh view]" << std::endl;
    }

    CloseHandle(hThread);
    return 0;
}