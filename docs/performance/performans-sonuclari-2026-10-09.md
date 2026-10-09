# MiniERP performans ölçümü ve uygulanan iyileştirmeler

9 Ekim 2026. Araştırma planındaki öncelikler uygulandı; önceki ve sonraki ölçümler kaydedildi. Günlük kullanımdaki genel gezinme yavaşlığında geliştirme modunun etkisi belirgin. Kod iyileştirmeleri üretim modunda da sıcak yanıt sürelerini düşürdü.

## Ölçüm kapsamı

- Yerel bilgisayar, Node.js v24.15.0, Next.js 15.5.20, Prisma 6.19.3 ve mevcut PostgreSQL veritabanı.
- Mevcut veri: 4 ürün, 3 müşteri, 2 tedarikçi, 36 satış siparişi, 58 satış kalemi, 55 fatura, 2 gider, 1 sohbet ve 7 mesaj.
- Her ekran için bir ilk istek ve ardından 20 sıralı istek. p50 ortanca, p95 en yavaş %5'e geçiş sınırıdır; ilk istek sıcak yüzdeliklere katılmadı.
- HTTP ölçümü mevcut aktif admin için bellekte oluşturulan kısa süreli test oturumuyla, normal middleware ve sunucu kullanıcı kontrolleri üzerinden yapıldı. Parola karşılaştırması/giriş akışı süreye dahil değil. Oturum belirteci ve gizli değerler rapor dosyalarına yazılmadı.
- Ölçülen süre, tam HTML yanıtının alınmasına kadar geçen süredir. Tarayıcı çizimi, JavaScript çalışması, LCP/INP ve gerçek tarayıcı menü geçişi ölçülmedi. Bunlar uçtan uca kullanıcı deneyimi süreleri olarak yorumlanmamalı.
- Üretim öncesi/sonrası ölçümleri diğer benchmark çalıştırılmadan ayrı tamamlandı. Başlangıç geliştirme ölçümünün bir bölümünde üretim karşılaştırması da çalıştı; geliştirme kıyaslaması gösterge niteliğindedir.
- Rapor önbelleği sonraki sıcak üretim ölçümlerinde aktiftir. Önbelleksiz servis karşılaştırması ayrıca verildi. Bu tek yerel koşu istatistiksel hız garantisi değildir; büyük veri veya eşzamanlı kullanıcı yükü denenmedi.

## Üretim modunda önce / sonra

Süreler milisaniye. Son sütun yalnızca bu ölçümdeki p50 değişimidir.

| Ekran | Önce p50 | Sonra p50 | Önce p95 | Sonra p95 | p50 azalma |
| --- | ---: | ---: | ---: | ---: | ---: |
| /dashboard | 41,2 | 27,7 | 58 | 36,3 | 32,8% |
| /products | 30,5 | 20,2 | 33 | 33,9 | 33,8% |
| /sales | 44,3 | 24,5 | 61,1 | 30,2 | 44,7% |
| /purchases | 36,1 | 19 | 40,8 | 22,1 | 47,4% |
| /invoices | 41,1 | 17,2 | 54,6 | 22 | 58,2% |
| /reports | 36,1 | 18,1 | 43,9 | 21,7 | 49,9% |
| /sales/new | 33,2 | 17 | 39,3 | 19,4 | 48,8% |
| /payments | 42,4 | 17,4 | 58,2 | 20 | 59% |

Ürünler ekranının p95 değeri 33 → 33,9 ms oldu; bu ölçümde p95 iyileşmesi yok. Diğer ekranların p50 ve p95 değerleri düşerken tek küçük örneklemdeki bütün dalgalanmaları kod değişikliğine bağlamak doğru olmaz.

İlk dashboard isteği son üretim sunucusunda 332 ms sürdü. Önceki üretim dosyası aynı sunucuda ikinci ölçüm koşusundan alındığı için ilk istek süreleri eşit soğuk başlangıç koşullarını temsil etmiyor; bunlardan ilk açılış hızlanma yüzdesi çıkarılmadı.

Ham veriler: [önce](before-production.json), [sonra](after-production.json).

## Geliştirme modunda önce / sonra

Süreler milisaniye. Derleme, geliştirme araçları ve ısınma etkisi vardır.

| Ekran | Önce p50 | Sonra p50 | Önce p95 | Sonra p95 |
| --- | ---: | ---: | ---: | ---: |
| /dashboard | 579,9 | 422,8 | 1109,9 | 542,3 |
| /products | 394,5 | 365,8 | 494,3 | 458,2 |
| /sales | 399,7 | 336 | 683,5 | 378,3 |
| /purchases | 399,8 | 336 | 469,1 | 376,8 |
| /invoices | 541,5 | 345,5 | 643,3 | 395,2 |
| /reports | 564,8 | 394 | 685,9 | 472,7 |
| /sales/new | 399,3 | 330,7 | 545,8 | 401,3 |
| /payments | 354,4 | 336 | 400,4 | 364,3 |

Dashboard ilk yanıtı önce 8745 ms, sonra 5748 ms. Derleme önbelleğinin durumu kontrollü biçimde sıfırlanmadığı için bu değerler günlük ilk açılışa dair gözlemdir; kodun tek başına sağladığı kazanç olarak sunulmaz.

Ham veriler: [önce](before-dev.json), [sonra](after-dev.json).

## Önbelleksiz servis ölçümü

Her servis için ilk çağrı hariç 20 tekrar. SQL sayısı gerçek Prisma query event'leriyle sayıldı. Süreler milisaniye. JSON boyutu servisin döndürdüğü değerin serileştirilmiş boyutudur; SQL ağ trafiği veya tarayıcı paket boyutu değildir.

| Servis | p50 önce → sonra | SQL sayısı | JSON byte |
| --- | ---: | ---: | ---: |
| dashboard | 23,1 → 10,5 | 20 → 10 | 2490 → 2615 |
| reports | 9,83 → 4,34 | 12 → 5 | 319 → 319 |
| products | 4,48 → 2,86 | 2 → 2 | 2458 → 775 |
| sales | 14,64 → 3,08 | 5 → 2 | 74572 → 1323 |
| chat | 18,3 → 9,01 | 12 → 7 | 789 → 413 |

Ürün ve satış servisinin sonraki ölçümü, ekranın kullandığı yeni sayfalı sorguya aittir; eski ölçüm bütün ilişkili nesneleri döndüren liste servisine aittir. Satışta yeni yanıt ilk sekiz kayıt ve sayfalama bilgisini içerir. Kalan kayıtlar diğer sayfalardan erişilebilir.

Ortak sayfa kabuğu artık bütün sohbet çalışma alanını hazırlamıyor. Tek sorguluk okunmamış mesaj özeti, sonraki ölçümde p50 1,24 ms / p95 1,7 ms. Sohbet paneli açılınca çalışma alanı alınıyor. Sohbet servisindeki SQL sayısı 12'den 7'ye indi; kullanıcı listesi yalnızca kişi/kanal seçme penceresi açıldığında sorgulanıyor.

Ham veriler: [önce](before-services.json), [sonra](after-services.json).

## Uygulanan değişiklikler

1. Ürün, müşteri, tedarikçi, satış, satın alma, fatura, ödeme, gider, stok ve stok hareketi ekranlarında sunucu sayfalaması ve araması. Sayfa başına sekiz kayıt, URL'de arama/sayfa durumu, 300 ms arama gecikmesi ve kararlı sıralama.
2. Aramada Türkçe I/ı ve İ/i eşleşmesi, görünen değerler ve alanlar arası arama korunuyor. % ve _ düz metin olarak aranıyor; istek metni SQL parametresi olarak gönderiliyor.
3. Satış ve satın alma formları için ayrı aktif ürün/müşteri/tedarikçi sorguları. Ödeme seçeneklerinde yalnızca uygun, kalan tutarı pozitif satın alma faturaları sorgulanıyor.
4. Dashboard grafiklerinin aylık toplamı, kritik stok sayısı, gerçekleşen ürün kârı ve rapor toplamları veritabanında hesaplanıyor. Satış geçmişinin bütün kalemleri uygulamaya taşınmıyor.
5. Dashboard kâr ayrıntısı sayfalı; üstteki toplam bütün aktif ürünlerden hesaplanmaya devam ediyor. İskonto, geçmiş birim maliyet, stockPosted ve iptal filtreleri korunuyor.
6. Dashboard ve raporlar için 30 saniyelik Next.js veri önbelleği. Satış, satın alma, ürün, müşteri, kategori, gider ve ödeme action'ları ilgili değişikliklerden sonra ortak rapor etiketini geçersiz kılıyor. Oturum/yetki kontrolü kalıcı önbelleğe alınmıyor.
7. Sohbet için küçük bir başlangıç özeti ve panelin ihtiyaç anında JavaScript yüklemesi. Açık/görünür panelde 15 saniyelik yenileme sürüyor; seçili konuşmada yalnızca son yüklenen mesajdan sonraki mesajlar isteniyor. Eski istek yanıtları yeni seçimi ezmiyor; polling kendi içinde üst üste binmiyor.
8. Recharts grafiklerinin Client Component üzerinden sonradan yüklenmesi. Üretim derlemesinde dashboard First Load JS 231 kB → 117 kB. Grafiklerin kendi paketi yine indiriliyor; bu değer toplam kullanım boyunca indirilen JavaScript miktarı değildir.
9. Aynı sunucu render'ında tekrar eden kullanıcı kontrolü React cache ile paylaşılabiliyor; farklı isteklerde kullanıcı aktifliği ve rolü yeniden okunuyor.

## İndeks kararı

EXPLAIN ANALYZE / BUFFERS ile son satışlar, bu ayın faturaları ve kritik stok sorguları incelendi. Bu koşuda yürütme süreleri sırasıyla 0,774 ms, 0,293 ms ve 0,071 ms. Tablolar çok küçük; sequential scan bu durumda tek başına sorun değildir.

Bu ölçümler yeni indeks ihtiyacını göstermedi. Şemaya veya veritabanına indeks eklenmedi, migration uygulanmadı. Daha büyük test verisinde tarih ve kararlı sayfalama indeksleri yeniden değerlendirilmelidir. Planlar: [query-plans.json](query-plans.json).

## Doğrulama

- `npm.cmd run lint`: geçti.
- `npm.cmd test`: mevcut iki domain testi geçti.
- `npm.cmd run test:performance`: altı doğrulama testi geçti. Türkçe arama, düz metin wildcard, SQL girdi güvenliği, sınır sayfa, kayıt kaybı/tekrarı, bütün ana liste değerleri, finansal sonuçlar, form seçenekleri ve artımlı sohbet kontrol edildi.
- `npm.cmd run build`: geçti.
- `node scripts/verify-http.cjs http://localhost:3111`: 14 ekran, sınır sayfa, boş arama, anonim yönlendirmesi ve mevcut satış rolünün erişim kısıtı geçti.
- Başlangıç dashboard/rapor çıktılarıyla yeni çıktılar karşılaştırıldı; mevcut finansal sonuçlar ve rapor satırları eşleşti.
- Gerçek finansal kayıtlarda onay, iptal veya ödeme mutasyonu çalıştırılmadı. Bu akışların transaction kodları değiştirilmedi. Önbellek invalidasyon kapsamı kod üzerinden denetlendi; gerçek kayıtlarda mutasyon sonrası uçtan uca cache testi yapılmadı.

## Yeniden ölçmek ve günlük kullanmak

Geliştirme sırasında:

```powershell
npm.cmd run dev
```

Günlük kullanımda üretim modunu denemek için, geliştirme sunucusu kapalıyken:

```powershell
npm.cmd run build
npm.cmd start
```

Başka terminalde, uygulama 3000 portunda çalışırken:

```powershell
npm.cmd run perf:http -- http://localhost:3000 docs/performance/local-http.json 20
npm.cmd run perf:services -- docs/performance/local-services.json local
npm.cmd run test:performance
node scripts/verify-http.cjs http://localhost:3000
node --import tsx scripts/explain-performance.ts
```

HTTP araçları yalnızca yerel HTTP adreslerini kabul eder. Servis araçları mevcut .env veritabanını kullanır; demo seed çalıştırmaz. Tam servis çıktılarını tutan .performance klasörü gitignore kapsamındadır; paylaşılan JSON dosyalarında yalnızca metrikler vardır. Sohbet çalışma alanı servisi mevcut uygulama davranışı gereği eksik genel kanal/üyelikleri hazırlayabilir; testler finansal kayıt eklemez veya silmez.

Sonraki ölçüm aşaması, ayrı bir test veritabanında daha büyük hacim ve eşzamanlı kullanıcılarla deneme ve gerçek tarayıcıda LCP/INP/gezinme ölçümüdür. Redis, PgBouncer veya yeni altyapı yatırımı için mevcut ölçümlerde gerekçe oluşmadı.
