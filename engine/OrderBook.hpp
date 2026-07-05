#pragma once 
#include <map>
#include <deque>
#include <vector>
#include <string>
#include <functional>

#define ll long long

struct Order 
{
    ll id; 
    ll quantity; 
    ll price;     
    bool type; 
    std::string userId; // Finalized

    Order(ll i, ll q, double rawPrice, bool t, const std::string &uid) 
        : id(i), quantity(q), type(t), userId(uid) 
    {
        price = (ll)(rawPrice * 10000); 
    }
};

struct Ticker { 
    ll midPrice; 
    ll lastPrice;
    ll bestBid;
    ll bestAsk;
    ll spread;
};

class OrderBook {
private:
    std::map<ll, std::deque<Order>, std::greater<ll>> bids;
    std::map<ll, std::deque<Order>> asks;
    
    ll lastTradedPrice = 0; 
    std::vector<std::string> pendingTrades;

    // === NEW: REALITY FORK VARIABLES ===
    ll priceOffset = 0;     // The mathematical gap between Kairon and Binance
    bool isDiverged = false; // Flag to indicate if we are in an isolated state

    void matchOrders(Order &IncomingOrder, std::string symbol);
    void executeSyntheticUIOrder(Order &order, std::string symbol); // Local market impact math

public:
    void addOrder(Order order, std::string symbol, bool isUI);
    Ticker getTicker();
    std::string getDepthSnapshot(std::string symbol);
    
    std::vector<std::string> flushTrades() {
        std::vector<std::string> temp = pendingTrades;
        pendingTrades.clear();
        return temp;
    }

    void resyncToWorld() {
        priceOffset = 0;
        isDiverged = false;
        bids.clear();
        asks.clear();
        pendingTrades.push_back("{\"type\":\"sys\",\"msg\":\"RESYNC\"}");
    }
};