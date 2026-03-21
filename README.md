# Demo Hệ thống Tìm kiếm Thương mại Điện tử Quy mô lớn

Dự án này là bản demo (PoC) để làm quen với các công cụ: **Elasticsearch, RabbitMQ, Nginx, Docker, và Kubernetes (K8s)**.

## 1. Cấu trúc thư mục
- `services/search-service`: API (Person A) để tìm kiếm từ Elasticsearch.
- `services/order-service`: API (Person B) xử lý đặt hàng và giữ tồn kho (Redis).
- `services/indexer-service`: Worker (Person B) để nhận event từ MQ và đồng bộ vào ES.
- `infrastructure/`: 
    - `docker/`: Chứa `docker-compose.yml` để chạy toàn bộ hệ thống.
    - `nginx/`: Cấu hình Load Balancer & Routing.
    - `k8s/`: Các manifest để triển khai lên Kubernetes.

## 2. Cách chạy cục bộ (Docker Compose)
Bạn cần cài đặt **Docker** và **Docker Compose**.

1.  Mở terminal tại thư mục `infrastructure/docker`.
2.  Chạy lệnh:
    ```bash
    docker-compose up --build
    ```
3.  Hệ thống sẽ khởi tạo 7 container:
    - **Nginx (Cổng 80):** Routing `/search` và `/order`.
    - **Elasticsearch (Cổng 9200):** Engine tìm kiếm.
    - **RabbitMQ (Cổng 5672):** Message Broker.
    - **PostgreSQL (Cổng 5432):** Database gốc.
    - **Redis (Cổng 6379):** Giữ hàng (Stock Reservation).
    - **Search Service (A):** Tìm kiếm.
    - **Order Service (B):** Đặt hàng.
    - **Indexer Service (B):** Đồng bộ dữ liệu.

## 3. Cách test Demo
Sau khi hệ thống đã chạy (chờ khoảng 30-60 giây để Elasticsearch khởi động xong):

### Bước 1: Tạo đơn hàng thử nghiệm
Sử dụng cURL hoặc Postman gửi request:
```bash
curl -X POST http://localhost/order -H "Content-Type: application/json" -d '{"productId": "p001", "quantity": 1}'
```
*Lưu ý: Bạn cần set stock trong Redis trước (ví dụ: `SET stock:p001 100`).*

### Bước 2: Kiểm tra kết quả
1. **Order Service** sẽ trừ stock trong Redis.
2. Bắn tin vào RabbitMQ.
3. **Indexer Worker** nhận tin và index thông tin lên Elasticsearch.
4. Bạn có thể tìm kiếm sản phẩm: `http://localhost/search?q=p001`

## 4. Triển khai Kubernetes
Các file trong `infrastructure/k8s/` được thiết kế để bạn làm quen với Kubernetes Manifests. 
- Để sử dụng, bạn cần cài đặt **Minikube** hoặc **Docker Desktop K8s**.
- Lưu ý: Bạn cần build và push Docker images lên Docker Hub (hoặc local registry) trước khi `apply` các file này.
- Lệnh mẫu:
    ```bash
    kubectl apply -f infrastructure/k8s/
    ```
# search-engine-poc
