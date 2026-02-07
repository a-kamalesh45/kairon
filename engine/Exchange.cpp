// This is how you manage ALL cryptos dynamically
#include <map>
#include <string>
#include "OrderBook.hpp"

class Exchange {
private:
    std::map<std::string, OrderBook> orderBooks;

public:
    void placeOrder(std::string symbol, Order order) {
        orderBooks[symbol].addOrder(order);
    }
};
