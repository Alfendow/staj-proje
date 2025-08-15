# Staj Projesi

Bu proje, bir kredi hesaplama ve başvuru sistemi uygulamasıdır. Frontend tarafı Angular ile, backend tarafı .NET Core ile yazılmıştır. Backend tarafında MySQL veritabanı kullanılmıştır.

## Proje Yapısı

- `staj-frontend`: Angular frontend uygulaması
- `stajapi`: .NET Core backend API

## Kullanılan Teknolojiler

### Frontend
- Angular 20
- TypeScript
- RxJS
- ngx-mask

### Backend
- .NET Core 9
- Entity Framework Core
- MySQL
- Swagger
- Rate Limiting

## Kurulum

### Ön Koşullar
- Node.js (v20 veya üzeri)
- .NET Core SDK (v9 veya üzeri)
- MySQL

### Projeyi Klonlama ve Çalıştırma

1.  **Depoyu klonlayın:**
    ```bash
    git clone <repo-url>
    cd staj-proje
    ```

2.  **Frontend Kurulumu:**
    - `staj-frontend` dizinine gidin: `cd staj-frontend`
    - Bağımlılıkları yükleyin: `npm install`
    - Uygulamayı başlatın: `npm start`
    - Uygulama `http://localhost:4200` adresinde çalışmaya başlayacaktır.

3.  **Backend Kurulumu:**
    - `stajapi` dizinine gidin: `cd stajapi`
    - Bağımlılıkları yükleyin: `dotnet restore`
    - Veritabanı migration'larını çalıştırın: `dotnet ef database update`
    - Uygulamayı başlatın: `dotnet run`
    - API `http://localhost:5000` adresinde çalışmaya başlayacaktır.

4.  **Veritabanı Ayarları:**
    - `stajapi/appsettings.json` dosyasında veritabanı bağlantı cümlesini kendi ortamınıza göre güncelleyin.
    - Eğer bir `.env` dosyası gerekiyorsa, örnek bir `.env.example` dosyası oluşturarak bunu belirtin. (Bu proje için gerekli değil gibi görünüyor, ancak genel bir bilgi olarak eklenmiştir.)

5.  **API Dökümantasyonu:**
    - Swagger UI üzerinden API'yi test edebilirsiniz: `http://localhost:5000/swagger`

## Katkıda Bulunma
1. Bu depoyu çatallayın (fork)
2. Yeni bir dal oluşturun (git checkout -b feature/yenilik)
3. Değişikliklerinizi işleyin (git commit -am 'Yeni bir özellik ekle')
4. Dalınızı ittirin (git push origin feature/yenilik)
5. Bir çekme isteği (pull request) oluşturun

## Lisans
Bu proje MIT lisansı ile lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.