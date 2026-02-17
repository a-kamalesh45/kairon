#include "OrderBook.hpp"
#include <iostream>
#include <algorithm>
#include <sstream>
#include <ctime>
#include <iomanip>

// Helper: Get current time as HH:MM:SS string
std::string get_time_str() {
    std::time_t t = std::time(nullptr);
    std::tm* now = std::localtime(&t);
    std::stringstream ss;
    ss << std::put_time(now, "%H:%M:%S");
    return ss.str();
}

void OrderBook::addOrder(Order order, std::string symbol)
{
    matchOrders(order, symbol);

    if (order.quantity > 0)
    {
        if (order.type) // BUY
        {
            bids[order.price].push_back(order);
        }
        else // SELL
        {
            asks[order.price].push_back(order);
        }
    }
}

void OrderBook::matchOrders(Order &incomingOrder, std::string symbol)
{
    bool isBuy = incomingOrder.type;

    if (isBuy) // BUY LOGIC
    {
        while (incomingOrder.quantity > 0 && !asks.empty() && asks.begin()->first <= incomingOrder.price)
        {
            auto bestAskIt = asks.begin(); 
            ll bestPrice = bestAskIt->first;
            auto& ordersAtPrice = bestAskIt->second;
            Order& bookOrder = ordersAtPrice.front(); 

            ll tradeQty = std::min(incomingOrder.quantity, bookOrder.quantity);
            
            // Update Last Traded Price
            lastTradedPrice = bestPrice;

            // === GENERATE TRADE EVENT (JSON) ===
            // We divide by 10000.0 to convert back to float for the UI
            std::stringstream json;
            json << "{\"type\":\"trade\","
                 << "\"symbol\":\"" << symbol << "\","
                 << "\"price\":" << (bestPrice / 10000.0) << ","
                 << "\"qty\":" << (tradeQty / 10000.0) << ","
                 << "\"side\":\"buy\","
                 << "\"time\":\"" << get_time_str() << "\"}";
            
            pendingTrades.push_back(json.str());
            // ===================================

            incomingOrder.quantity -= tradeQty;
            bookOrder.quantity -= tradeQty;

            if (bookOrder.quantity == 0) ordersAtPrice.pop_front();
            if (ordersAtPrice.empty()) asks.erase(bestAskIt);
        }
    }
    else // SELL LOGIC
    {
        while (incomingOrder.quantity > 0 && !bids.empty() && bids.begin()->first >= incomingOrder.price)
        {
            auto bestBidIt = bids.begin();
            ll bestPrice = bestBidIt->first;
            auto& ordersAtPrice = bestBidIt->second;
            Order& bookOrder = ordersAtPrice.front();

            ll tradeQty = std::min(incomingOrder.quantity, bookOrder.quantity);
            
            lastTradedPrice = bestPrice;

            // === GENERATE TRADE EVENT (JSON) ===
            std::stringstream json;
            json << "{\"type\":\"trade\","
                 << "\"symbol\":\"" << symbol << "\","
                 << "\"price\":" << (bestPrice / 10000.0) << ","
                 << "\"qty\":" << (tradeQty / 10000.0) << ","
                 << "\"side\":\"sell\","
                 << "\"time\":\"" << get_time_str() << "\"}";
            
            pendingTrades.push_back(json.str());
            // ===================================

            incomingOrder.quantity -= tradeQty;
            bookOrder.quantity -= tradeQty;

            if (bookOrder.quantity == 0) ordersAtPrice.pop_front();
            if (ordersAtPrice.empty()) bids.erase(bestBidIt);
        }
    }
}

Ticker OrderBook::getTicker() {
    Ticker ticker = {};
    ticker.bestBid = (!bids.empty()) ? bids.begin()->first : 0;
    ticker.bestAsk = (!asks.empty()) ? asks.begin()->first : 0;
    
    if (ticker.bestBid > 0 && ticker.bestAsk > 0) {
        ticker.midPrice = (ticker.bestBid + ticker.bestAsk) / 2;
        ticker.spread = ticker.bestAsk - ticker.bestBid;
    }
    
    ticker.lastPrice = lastTradedPrice; 
    return ticker;
}