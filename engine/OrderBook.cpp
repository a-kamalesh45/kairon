#include "OrderBook.hpp"
#include <iostream>
#include <algorithm>
#include <sstream>
#include <ctime>
#include <iomanip>
#include <chrono>

using namespace std;

// --- THE FIX: Output Unix Milliseconds instead of HH:MM:SS ---
string get_timestamp_ms_str()
{
    auto now = chrono::system_clock::now();
    auto ms = chrono::duration_cast<chrono::milliseconds>(now.time_since_epoch()).count();
    return to_string(ms);
}

void OrderBook::addOrder(Order order, string symbol, bool isUI)
{
    if (isUI)
    {
        executeSyntheticUIOrder(order, symbol);
    }
    else
    {
        if (isDiverged)
        {
            order.price += priceOffset;
        }

        matchOrders(order, symbol);

        if (order.quantity > 0)
        {
            if (order.type)
                bids[order.price].push_back(order);
            else
                asks[order.price].push_back(order);
        }
    }
}

void OrderBook::executeSyntheticUIOrder(Order &order, string symbol)
{
    double slippagePerUnit = 10.0;

    double qtyFloat = order.quantity / 10000.0;
    ll priceShift = (ll)(qtyFloat * slippagePerUnit * 10000.0);

    if (!order.type)
    {
        priceShift = -priceShift;
    }

    priceOffset += priceShift;
    isDiverged = true;

    // Prevent engine freeze
    bids.clear();
    asks.clear();

    ll executedPrice = (lastTradedPrice > 0 ? lastTradedPrice : order.price) + priceShift;
    lastTradedPrice = executedPrice;

    cout << "\n\033[35m"
         << "  💥 [LOCAL IMPACT] "
         << (order.type ? "BUY " : "SELL ")
         << qtyFloat << " " << symbol
         << " | Price gap shifted by $" << (priceShift / 10000.0)
         << " to $" << (executedPrice / 10000.0)
         << "\033[0m\n"
         << endl;

    stringstream json;
    json << "{\"type\":\"trade\","
         << "\"symbol\":\"" << symbol << "\","
         << "\"price\":" << (executedPrice / 10000.0) << ","
         << "\"qty\":" << qtyFloat << ","
         << "\"side\":\"" << (order.type ? "buy" : "sell") << "\","
         << "\"timestamp\":" << static_cast<long long>(time(nullptr)) << ","
         << "\"time\":\"" << get_timestamp_ms_str() << "\","
         << "\"user\":\"" << order.userId << "\"}";

    pendingTrades.push_back(json.str());
}

void OrderBook::matchOrders(Order &incomingOrder, string symbol)
{
    bool isBuy = incomingOrder.type;

    if (isBuy)
    {
        while (incomingOrder.quantity > 0 &&
               !asks.empty() &&
               asks.begin()->first <= incomingOrder.price)
        {
            auto bestAskIt = asks.begin();
            ll bestPrice = bestAskIt->first;
            auto &ordersAtPrice = bestAskIt->second;
            Order &bookOrder = ordersAtPrice.front();

            ll tradeQty = min(incomingOrder.quantity, bookOrder.quantity);
            lastTradedPrice = bestPrice;

            stringstream json;
            json << "{\"type\":\"trade\","
                 << "\"symbol\":\"" << symbol << "\","
                 << "\"price\":" << (bestPrice / 10000.0) << ","
                 << "\"qty\":" << (tradeQty / 10000.0) << ","
                 << "\"side\":\"" << (isBuy ? "buy" : "sell") << "\","
                 << "\"timestamp\":" << static_cast<long long>(time(nullptr)) << ","
                 << "\"time\":\"" << get_timestamp_ms_str() << "\","
                 << "\"user\":\"" << bookOrder.userId << "\"}"; // Correct field

            pendingTrades.push_back(json.str());

            incomingOrder.quantity -= tradeQty;
            bookOrder.quantity -= tradeQty;

            if (bookOrder.quantity == 0)
                ordersAtPrice.pop_front();

            if (ordersAtPrice.empty())
                asks.erase(bestAskIt);
        }
    }
    else
    {
        while (incomingOrder.quantity > 0 &&
               !bids.empty() &&
               bids.begin()->first >= incomingOrder.price)
        {
            auto bestBidIt = bids.begin();
            ll bestPrice = bestBidIt->first;
            auto &ordersAtPrice = bestBidIt->second;
            Order &bookOrder = ordersAtPrice.front();

            ll tradeQty = min(incomingOrder.quantity, bookOrder.quantity);
            lastTradedPrice = bestPrice;

            stringstream json;
            json << "{\"type\":\"trade\","
                 << "\"symbol\":\"" << symbol << "\","
                 << "\"price\":" << (bestPrice / 10000.0) << ","
                 << "\"qty\":" << (tradeQty / 10000.0) << ","
                 << "\"side\":\"sell\","
                 << "\"timestamp\":" << static_cast<long long>(time(nullptr)) << ","
                 << "\"time\":\"" << get_timestamp_ms_str() << "\"}"
                 << "\"user\":\"" << bookOrder.userId << "\"}";

            pendingTrades.push_back(json.str());

            incomingOrder.quantity -= tradeQty;
            bookOrder.quantity -= tradeQty;

            if (bookOrder.quantity == 0)
                ordersAtPrice.pop_front();

            if (ordersAtPrice.empty())
                bids.erase(bestBidIt);
        }
    }
}

Ticker OrderBook::getTicker()
{
    Ticker ticker = {};

    ticker.bestBid = (!bids.empty()) ? bids.begin()->first : 0;
    ticker.bestAsk = (!asks.empty()) ? asks.begin()->first : 0;

    if (ticker.bestBid > 0 && ticker.bestAsk > 0)
    {
        ticker.midPrice = (ticker.bestBid + ticker.bestAsk) / 2;
        ticker.spread = ticker.bestAsk - ticker.bestBid;
    }

    ticker.lastPrice = lastTradedPrice;
    return ticker;
}

string OrderBook::getDepthSnapshot(string symbol)
{
    stringstream json;

    json << "{\"type\":\"depth\",\"symbol\":\""
         << symbol
         << "\",\"bids\":[";

    int count = 0;

    for (auto it = bids.begin(); it != bids.end() && count < 15; ++it, ++count)
    {
        double price = it->first / 10000.0;
        double qty = 0;

        for (const auto &order : it->second)
            qty += (order.quantity / 10000.0);

        json << "[" << price << "," << qty << "]";

        if (count < 14 && next(it) != bids.end())
            json << ",";
    }

    json << "],\"asks\":[";

    count = 0;

    for (auto it = asks.begin(); it != asks.end() && count < 15; ++it, ++count)
    {
        double price = it->first / 10000.0;
        double qty = 0;

        for (const auto &order : it->second)
            qty += (order.quantity / 10000.0);

        json << "[" << price << "," << qty << "]";

        if (count < 14 && next(it) != asks.end())
            json << ",";
    }

    json << "]}";

    return json.str();
}