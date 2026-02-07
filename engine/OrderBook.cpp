#include "OrderBook.hpp"
#include <iostream>
#include <algorithm>

void OrderBook::addOrder(Order order)
{
    matchOrders(order);

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

void OrderBook::matchOrders(Order &incomingOrder)
{
    // === BUY LOGIC ===
    if (incomingOrder.type) // If incoming is BUY
    {
        while (incomingOrder.quantity > 0 && !asks.empty() && asks.begin()->first <= incomingOrder.price)
        {
            auto bestAskIt = asks.begin(); 
            ll bestPrice = bestAskIt->first;
            auto& ordersAtPrice = bestAskIt->second;
            Order& bookOrder = ordersAtPrice.front(); 

            ll tradeQty = std::min(incomingOrder.quantity, bookOrder.quantity);
            
            // === CRITICAL FIX: Update Last Traded Price ===
            lastTradedPrice = bestPrice;
            // ==============================================

            incomingOrder.quantity -= tradeQty;
            bookOrder.quantity -= tradeQty;

            if (bookOrder.quantity == 0) {
                ordersAtPrice.pop_front();
            }
            if (ordersAtPrice.empty()) {
                asks.erase(bestAskIt);
            }
        }
    }
    // === SELL LOGIC ===
    else // If incoming is SELL
    {
        while (incomingOrder.quantity > 0 && !bids.empty() && bids.begin()->first >= incomingOrder.price)
        {
            auto bestBidIt = bids.begin();
            ll bestPrice = bestBidIt->first;
            auto& ordersAtPrice = bestBidIt->second;
            Order& bookOrder = ordersAtPrice.front();

            ll tradeQty = std::min(incomingOrder.quantity, bookOrder.quantity);

            // === CRITICAL FIX: Update Last Traded Price ===
            lastTradedPrice = bestPrice;
            // ==============================================

            incomingOrder.quantity -= tradeQty;
            bookOrder.quantity -= tradeQty;

            if (bookOrder.quantity == 0) ordersAtPrice.pop_front();
            if (ordersAtPrice.empty()) bids.erase(bestBidIt);
        }
    }
}

Ticker OrderBook::getTicker() {
    Ticker ticker = {};
    
    // 1. Get Best Prices
    ticker.bestBid = (!bids.empty()) ? bids.begin()->first : 0;
    ticker.bestAsk = (!asks.empty()) ? asks.begin()->first : 0;

    // 2. Calculate Mid Price & Spread
    // Note: Since we use integers, (100 + 101)/2 becomes 100. This is standard for ints.
    if (ticker.bestBid > 0 && ticker.bestAsk > 0) {
        ticker.midPrice = (ticker.bestBid + ticker.bestAsk) / 2;
        ticker.spread = ticker.bestAsk - ticker.bestBid;
    } else {
        ticker.midPrice = 0;
        ticker.spread = 0;
    }

    // 3. Return the REAL Last Traded Price (Fixed)
    ticker.lastPrice = lastTradedPrice; 

    return ticker;
}