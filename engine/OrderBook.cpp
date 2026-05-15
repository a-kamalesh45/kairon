#include "OrderBook.hpp"
#include <iostream>
#include <algorithm>
#include <sstream>
#include <ctime>
#include <iomanip>
#include <chrono> // Added for high-precision Unix Milliseconds

// --- THE FIX: Output Unix Milliseconds instead of HH:MM:SS ---
std::string get_timestamp_ms_str() {
    auto now = std::chrono::system_clock::now();
    auto ms = std::chrono::duration_cast<std::chrono::milliseconds>(now.time_since_epoch()).count();
    return std::to_string(ms);
}

void OrderBook::addOrder(Order order, std::string symbol, bool isUI)
{
    if (isUI) {
        executeSyntheticUIOrder(order, symbol);
    } else {
        if (isDiverged) {
            order.price += priceOffset;
        }
        
        matchOrders(order, symbol);

        if (order.quantity > 0) {
            if (order.type) bids[order.price].push_back(order);
            else asks[order.price].push_back(order);
        }
    }
}

void OrderBook::executeSyntheticUIOrder(Order &order, std::string symbol)
{
    double slippagePerUnit = 10.0; 
    
    double qtyFloat = order.quantity / 10000.0; 
    ll priceShift = (ll)(qtyFloat * slippagePerUnit * 10000.0);

    if (!order.type) { 
        priceShift = -priceShift;
    }

    priceOffset += priceShift;
    isDiverged = true;

    ll executedPrice = (lastTradedPrice > 0 ? lastTradedPrice : order.price) + priceShift;
    lastTradedPrice = executedPrice;

    std::cout << "\n\033[35m" 
              << "  💥 [LOCAL IMPACT] " << (order.type ? "BUY " : "SELL ") << qtyFloat 
              << " " << symbol << " | Price gap shifted by $" << (priceShift / 10000.0) 
              << " to $" << (executedPrice / 10000.0)
              << "\033[0m\n" << std::endl;

    std::stringstream json;
    json << "{\"type\":\"trade\","
         << "\"symbol\":\"" << symbol << "\","
         << "\"price\":" << (executedPrice / 10000.0) << ","
         << "\"qty\":" << qtyFloat << ","
         << "\"side\":\"" << (order.type ? "buy" : "sell") << "\","
         << "\"timestamp\":" << static_cast<long long>(std::time(nullptr)) << ","
         << "\"time\":\"" << get_timestamp_ms_str() << "\"}"; // Now sends raw MS time
    
    pendingTrades.push_back(json.str());
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
            lastTradedPrice = bestPrice;

            std::stringstream json;
            json << "{\"type\":\"trade\",\"symbol\":\"" << symbol << "\",\"price\":" << (bestPrice / 10000.0) << ",\"qty\":" << (tradeQty / 10000.0) << ",\"side\":\"buy\",\"timestamp\":" << static_cast<long long>(std::time(nullptr)) << ",\"time\":\"" << get_timestamp_ms_str() << "\"}";
            pendingTrades.push_back(json.str());

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

            std::stringstream json;
            json << "{\"type\":\"trade\",\"symbol\":\"" << symbol << "\",\"price\":" << (bestPrice / 10000.0) << ",\"qty\":" << (tradeQty / 10000.0) << ",\"side\":\"sell\",\"timestamp\":" << static_cast<long long>(std::time(nullptr)) << ",\"time\":\"" << get_timestamp_ms_str() << "\"}";
            pendingTrades.push_back(json.str());

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