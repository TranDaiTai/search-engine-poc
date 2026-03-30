# 🚀 Hướng dẫn chạy demo trên máy khác

## Yêu cầu
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) đã cài và đang chạy
- Kết nối internet (để pull images)

---

## Chuẩn bị: Copy các file sau lên máy demo

Chỉ cần copy **thư mục này** (`infrastructure/docker/`) gồm:
```
docker/
├── docker-compose.prod.yml   ← file chính để chạy
├── nginx.conf                ← cấu hình API Gateway
├── init.sql                  ← khởi tạo database schema
└── seed_data.sql             ← dữ liệu mẫu (nếu có)
```

> 💡 `seed_data.sql` nằm ở thư mục gốc project, copy vào cùng thư mục này.

---

## Chạy trên máy demo

### Bước 1 — Mở terminal, vào thư mục chứa file

```bash
cd đường-dẫn-tới-thư-mục-docker
```

### Bước 2 — Pull tất cả images về

```bash
docker-compose -f docker-compose.prod.yml pull
```

### Bước 3 — Khởi động toàn bộ hệ thống

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Bước 4 — Kiểm tra tất cả container đang chạy

```bash
docker-compose -f docker-compose.prod.yml ps
```

---

## Truy cập ứng dụng

| Service            | URL                              |
|--------------------|----------------------------------|
| 🌐 Web App         | http://localhost                 |
| 🔍 Kibana (ES UI)  | http://localhost:5601            |
| 🐰 RabbitMQ UI     | http://localhost:15672           |
| 🗄️ pgAdmin         | http://localhost:5050 (nếu bật) |

> **RabbitMQ login**: user / password

---

## Dừng hệ thống

```bash
# Dừng nhưng giữ data
docker-compose -f docker-compose.prod.yml down

# Dừng và xóa toàn bộ data (reset sạch)
docker-compose -f docker-compose.prod.yml down -v
```

---

## Troubleshooting

**Lỗi "port already in use"**
```bash
# Xem process nào đang dùng port 80
netstat -ano | findstr :80
```

**Xem log của 1 service**
```bash
docker logs search-service-demo -f
docker logs order-service-demo -f
docker logs web-frontend-demo -f
```

**Elasticsearch khởi động chậm** — đợi ~30 giây rồi thử lại, hoặc:
```bash
docker logs es-demo -f
```
