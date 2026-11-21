CREATE DATABASE IF NOT EXISTS voicekhata
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE voicekhata;

-- Shop owners and customers (role is OWNER or CUSTOMER)
CREATE TABLE IF NOT EXISTS vendors (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  vendor_name VARCHAR(60)  NOT NULL,
  phone       VARCHAR(10)  NOT NULL UNIQUE,
  pin_hash    VARCHAR(100) NOT NULL,
  role        VARCHAR(10)  NOT NULL DEFAULT 'OWNER',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- The customers of each shop
CREATE TABLE IF NOT EXISTS customers (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  vendor_id  BIGINT      NOT NULL,
  name       VARCHAR(60) NOT NULL,
  phone      VARCHAR(10),
  created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_vendor_customer (vendor_id, name),
  FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Every credit and payment entry
CREATE TABLE IF NOT EXISTS transactions (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  vendor_id        BIGINT        NOT NULL,
  customer_id      BIGINT        NOT NULL,
  type             VARCHAR(10)   NOT NULL,          -- CREDIT or PAYMENT
  item_name        VARCHAR(40),
  quantity         INT           NOT NULL DEFAULT 0,
  amount           DECIMAL(10,2) NOT NULL,
  voice_text       VARCHAR(255),
  transaction_date DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vendor_id)   REFERENCES vendors(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);