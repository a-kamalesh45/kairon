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

    // Constructor accepts DOUBLE, but stores LONG LONG for precision
    Order(ll i, ll q, double rawPrice, bool t) 
        : id(i), quantity(q), type(t) 
    {
        // Example: $50.125 -> 501250 (Scaled by 10000)
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

    // === NEW: Buffer to store trade events ===
    std::vector<std::string> pendingTrades;

    // Modified matchOrders to accept symbol for JSON generation
    void matchOrders(Order &IncomingOrder, std::string symbol);

public:
    void addOrder(Order order, std::string symbol);
    Ticker getTicker();
    
    // === NEW: Method to retrieve and clear pending trades ===
    std::vector<std::string> flushTrades() {
        std::vector<std::string> temp = pendingTrades;
        pendingTrades.clear();
        return temp;
    }
};