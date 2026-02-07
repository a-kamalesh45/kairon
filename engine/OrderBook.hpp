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

    Order(ll i, ll q, double rawPrice, bool t) 
        : id(i), quantity(q), type(t) 
    {
        price = (ll)(rawPrice * 100000); 
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

    // --- NEW: Buffer for trade events ---
    std::vector<std::string> pendingTrades;

    void matchOrders(Order &IncomingOrder, std::string symbol); // Added symbol param

public:
    void addOrder(Order order, std::string symbol); // Added symbol param
    Ticker getTicker();
    
    // --- NEW: Flush method ---
    std::vector<std::string> flushTrades() {
        std::vector<std::string> temp = pendingTrades;
        pendingTrades.clear();
        return temp;
    }
};