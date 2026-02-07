#pragma once
#include <iostream>
#include <string>
#include <vector>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <algorithm> 

#pragma comment(lib, "ws2_32.lib")

class SimpleRedis {
private:
    SOCKET sock;
    std::string host;
    int port;

public:
    SimpleRedis(std::string h, int p) : host(h), port(p), sock(INVALID_SOCKET) {}

    bool connect() {
        WSADATA wsaData;
        WSAStartup(MAKEWORD(2, 2), &wsaData);

        sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock == INVALID_SOCKET) return false;

        sockaddr_in server;
        server.sin_family = AF_INET;
        server.sin_port = htons(port);
        server.sin_addr.s_addr = inet_addr(host.c_str());

        if (server.sin_addr.s_addr == INADDR_NONE) {
            struct hostent* he = gethostbyname(host.c_str());
            if (he) memcpy(&server.sin_addr, he->h_addr_list[0], he->h_length);
        }

        if (::connect(sock, (struct sockaddr*)&server, sizeof(server)) < 0) {
            return false;
        }
        return true;
    }

    void sendCmd(const std::string& cmd) {
        std::string formatted = cmd + "\r\n";
        send(sock, formatted.c_str(), formatted.length(), 0);
    }

    // --- NEW: PUBLISH COMMAND ---
    void publish(std::string channel, std::string message) {
        // Redis Protocol: *3\r\n$7\r\nPUBLISH\r\n$chanLen\r\nchan\r\n$msgLen\r\nmsg\r\n
        std::string cmd = "*3\r\n$7\r\nPUBLISH\r\n$" + 
                          std::to_string(channel.length()) + "\r\n" + channel + "\r\n$" + 
                          std::to_string(message.length()) + "\r\n" + message + "\r\n";
        
        send(sock, cmd.c_str(), cmd.length(), 0);
        
        // We don't wait for response to keep it fast (Fire & Forget)
        // But we need to clear the buffer or connection might get desynced.
        // For HFT, usually we use a separate connection for async publishing.
        // For this demo, we'll just do a quick blocking read.
        readResp(); 
    }
    // ----------------------------

    std::string readResp() {
        char buffer[1024];
        int bytesReceived = recv(sock, buffer, 1023, 0);
        if (bytesReceived <= 0) return "";
        buffer[bytesReceived] = '\0';
        return std::string(buffer);
    }

    std::string consume(std::string queueName) {
        std::string cmd = "*3\r\n$5\r\nBLPOP\r\n$" + std::to_string(queueName.length()) + "\r\n" + queueName + "\r\n$1\r\n0\r\n";
        send(sock, cmd.c_str(), cmd.length(), 0);

        std::string raw = readResp();
        size_t lastPos = raw.rfind('\n');
        if (lastPos == std::string::npos) return "";
        
        size_t valueStart = raw.find_last_of('\n', lastPos - 2); 
        if (valueStart == std::string::npos) return "";

        std::string payload = raw.substr(valueStart + 1);
        
        payload.erase(std::remove(payload.begin(), payload.end(), '\r'), payload.end());
        payload.erase(std::remove(payload.begin(), payload.end(), '\n'), payload.end());
        
        return payload;
    }
};