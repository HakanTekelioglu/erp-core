# MiniERP performans araştırması

Tarih: 9 Ekim 2026. Kapsam: mevcut kodun, yapılandırmanın, geçmiş geliştirme loglarının ve resmi teknik kaynakların incelenmesi. Kullanıcının bildirdiği sorun: yerel bilgisayarda `npm run dev` ile genel sayfa açılışları ve menü geçişlerinin yavaşlığı.

Bu çalışma bir araştırma raporudur. Uygulama kodu, bağımlılıklar ve veritabanı değiştirilmedi; yeni bir sunucu başlatılmadı. Güncel tarayıcı ölçümü, üretim karşılaştırması ve SQL yürütme planı alınmadı. Aşağıdaki etkiler koddan yapılan çıkarımlardır; doğrulanmış hız kazanımı veya yüzde değildir.

## Sonuç ve önerilen sıra

İlk iş aynı ekranları geliştirme ve üretim modunda karşılaştırmak olmalı. Ardından ortak sayfa kabuğundaki sohbet yükü azaltılmalı ve liste sorguları sayfalanmalı. Dashboard sorguları, uygun indeksler ve kontrollü önbellek sonraki adımlardır. Bu sıra kullanıcının genel gezinme sorununu hedefler.

| Sıra | İş | Beklenen fayda | Göreli efor |
| --- | --- | --- | --- |
| 1 | Geliştirme/üretim karşılaştırması ve başlangıç ölçümü | Derleme beklemesini uygulama darboğazından ayırır | Küçük |
| 2 | Sohbeti sayfa kabuğunun beklediği işlerden ayırma | İlk açılışı ve sohbet açıkken sunucu yükünü azaltabilir | Orta |
| 3 | Sunucuda sayfalama, filtreleme ve dar alan seçimi | Liste ekranlarında veri aktarımını ve işlem yükünü azaltır | Orta |
| 4 | Formlar için ayrı, küçük seçenek sorguları | Yeni sipariş ve ödeme ekranlarını hafifletir | Küçük–orta |
| 5 | Dashboard/rapor hesaplarını veritabanında toplama | Veri büyüdükçe bellek ve sorgu maliyetini azaltır | Orta |
| 6 | Ölçümle seçilen indeksler | Filtreleme ve sıralamayı hızlandırabilir | Küçük–orta |
| 7 | Eksiksiz invalidasyonla önbellek | Tekrarlanan rapor ve sabit bilgi okumalarını azaltır | Orta |
| 8 | JavaScript paket analizi ve bileşen bazlı yükleme | Tarayıcının ilk yükleme ve etkileşim işini azaltabilir | Küçük–orta |

Eforlar süre taahhüdü değildir. Gerçek veri miktarı ve karşılaştırma sonuçları sırayı değiştirebilir.

## İncelenen teknoloji

`package-lock.json` içindeki çözülmüş sürümler: Next.js 15.5.20, React 19.2.7, Prisma Client/CLI 6.19.3 ve Recharts 3.9.0. `docker-compose.yml` PostgreSQL 16 imajını tanımlar; çalışan veritabanı sürümü doğrulanmadı. Öneriler Next.js 15, Prisma 6 ve PostgreSQL 16 belgelerine göre hazırlanmıştır.

## 1. Geliştirme modunun etkisi

`package.json` içindeki geliştirme komutu `next dev --turbopack`; üretim komutları `next build` ve `next start`. Geliştirme ortamının ilk sayfa derlemeleri kullanıcı tarafından yavaşlık olarak hissedilebilir. Next.js, performansı değerlendirmek için yerel üretim derlemesiyle çalıştırmayı önerir. [Next.js 15 üretim rehberi](https://nextjs.org/docs/15/app/guides/production-checklist)

Geçmiş `.codex-dev-chat.log` dosyasında `/products` için 3136 ms ve başka bir istekte 155 ms; `/dashboard` için 657 ms ve 322 ms kayıtları var. `.codex-dev-3010.log` içinde `/reports` derlemesi 1438 ms, isteği 1976 ms görünüyor. Bunlar geçmiş sunucu log süreleridir; güncel benchmark, tarayıcının tamamen hazır olma süresi veya aynı koşullarda yapılmış karşılaştırma değildir. Derleme ve ısınma etkisinin araştırılmasını destekler; yavaşlığın tek nedenini kanıtlamaz.

Uygulama aşamasında aynı makine, veritabanı, veri ve kullanıcı rolüyle ilk açılış ve tekrarlanan açılışlar ayrı ölçülmeli. Geliştirme sırasında `npm run dev` kullanılabilir; günlük kullanımın üretim derlemesiyle ne kadar iyileştiği ayrıca görülmeli. Mevcut `next.config.mjs` geliştirme çıktısını `.next-dev`, üretim çıktısını `.next` içinde tutuyor.

## 2. Ortak sayfa kabuğundaki sohbet yükü

Kanıt: `src/components/layout/app-shell.tsx:23`, `src/services/chat-service.ts:57`, `src/components/chat/chat-dock-shell.tsx:169`.

`AppShell`, yetki kontrolünden sonra ayarları ve `getChatWorkspace` sonucunu bekliyor. Sohbet kapalı olsa bile bu sunucu render'ında sohbet çalışma alanı hazırlanıyor. Next.js ortak layout'u gezinmede yeniden kullanabildiğinden bu işin istisnasız her menü geçişinde tekrarlandığı ileri sürülemez; ilk açılış ve kabuğun yeniden değerlendirildiği istekler ölçülmeli.

Çalışma alanı okuması genel kanalı `upsert` ile kontrol ediyor, erişilebilir konuşmaları üyeleri ve son mesajlarıyla alıyor, gerekirse üyelik oluşturuyor, okunmamış mesajları sayıyor ve aktif kullanıcıları getiriyor. Seçili konuşma varsa son 100 mesaj da yükleniyor. Sohbet açık ve sekme görünürken bu iş 15 saniyede bir tekrarlanıyor. Kapalı panelde polling yapılmaması zaten doğru bir iyileştirme.

Öneri: kabuk için küçük bir bildirim özeti; panel açıldığında konuşma listesi; kişi seçme ekranı açıldığında kullanıcı araması; konuşma açıldığında mesajlar. Yenilemelerde yalnızca yeni/değişen mesajlar alınmalı ve üst üste istekler engellenmeli. Kanal/üyelik hazırlığı tekrar eden okuma yolundan uygun bir ilk hazırlama akışına taşınmalı; kanal erişimi korunmalı.

15 saniyelik aralık, sürekli açık ve görünür bir panel için dakikada yaklaşık dört çalışma alanı yenilemesi demektir. Elli eşzamanlı açık panel varsayımında yaklaşık 200 yenileme/dakika olur; bu kullanıcı sayısı mevcut sistem için ölçülmüş değildir. SSE/WebSocket seçimi ancak daha küçük yenileme sorguları denendikten ve barındırma koşulları öğrenildikten sonra değerlendirilmeli.

## 3. Görsel sayfalama bütün veriyi çekmeyi engellemiyor

Kanıt: `src/components/tables/data-table.tsx:24`, `src/services/product-service.ts:4`, `src/services/sales-service.ts:24`, `src/services/purchase-service.ts:24`, `src/services/invoice-service.ts:103`.

Ortak tablo varsayılan olarak sekiz satır gösteriyor; fakat önce bütün `rows` dizisi geliyor. Arama tarayıcıda bütün satırlarda çalışıyor ve sayfalama `slice` ile yapılıyor. Ürün, satış, satın alma ve fatura liste sorgularında kayıt limiti bulunmuyor. Örneğin satış listesi yalnızca müşteri adı ve sipariş özeti gösterdiği halde kalemler, ürünler ve fatura da sorgulanıyor.

Öneri: URL üzerinden arama/filtre/sayfa parametreleri, veritabanında `where`, `take` ve başlangıçta `skip`; ekranda gereken alanlarla `select`. İlk deneme için 25–50 satır makul bir ürün kararıdır. Büyük hareket listelerinde derin offset yerine cursor/keyset değerlendirilmeli; `(createdAt, id)` gibi kararlı sıralama ve bu sıralamaya uygun devam koşulu tasarlanmalı. `cuid` kimliği zaman sırasını tek başına temsil ediyormuş gibi kullanılmamalı. Prisma, offset'in derin sayfalarda artan maliyetini ve cursor yaklaşımının kullanım farklarını açıklar. [Prisma 6 sayfalama](https://www.prisma.io/docs/orm/v6/prisma-client/queries/pagination)

Mevcut Türkçe arama davranışı korunmalı: `I/ı`, `İ/i`, kategori/durum adları ve tabloda aranan diğer alanlar kontrol edilmeli. Sunucuya taşıma yalnızca görünen sayfanın içinde arama yapmaya dönüşmemeli. Dar alan seçimi için kaynak: [Prisma 6 select rehberi](https://www.prisma.io/docs/orm/v6/prisma-client/queries/select-fields).

## 4. Form seçenekleri liste servislerinden ayrılmalı

Kanıt: `src/app/(erp)/sales/new/page.tsx`, `src/app/(erp)/purchases/new/page.tsx`, `src/app/(erp)/payments/page.tsx`.

Yeni satış/satın alma ekranları bütün müşteri/tedarikçi ve ürün listelerini alıp sonradan aktif kayıtları seçiyor. Ürün servisinin ilişki sayaçları form seçenekleri için de hesaplanıyor. Bu sayaçlar ürün tablosunda silme davranışı için kullanılıyor; öneri onları her yerden kaldırmak değil, form için ayrı sorgu yazmak.

Ödeme ekranı bütün faturaları, taraf bilgilerini ve ödeme ilişkilerini getirip uygun satın alma faturalarını uygulamada filtreliyor. Öneri: aktif kayıtları ve ödeme koşullarını sorguda filtrelemek; yalnızca form alanlarını seçmek; büyük veri hacminde gecikmeli uzaktan arama kullanmak. Ödeme oluşturulurken kalan tutar ve fatura durumu transaction içinde yeniden doğrulanmaya devam etmeli.

## 5. Dashboard ve rapor hesapları

Kanıt: `src/services/report-service.ts:58`, `:118`, `:225`; `src/services/stock-service.ts:104`.

Dashboard ana bölümünde 14 Prisma işlemi paralel başlatılıyor. Rapor ayını seçmek için öncesinde 2 veya 4 işlem, en çok satan ürünler varsa sonrasında bir işlem daha var: toplam 16–19 Prisma çağrısı. İlişki yüklemeleri nedeniyle gerçek SQL sayısı farklı olabilir; bu sayı SQL ölçümü değildir.

Özellikle kâr tablosu bütün aktif ürünlerin uygun satış kalemlerini tarih sınırı olmadan yüklüyor. Grafikler altı aylık ham fatura/gider kayıtlarını uygulamaya getirip aylara ayırıyor. Rapor özeti toplam hesaplamak için faturaları ve giderleri tek tek alıyor. Kritik stok hesabı bütün aktif ürünleri çekip iki kolonu uygulamada karşılaştırıyor.

Öneri: rapor özetlerinde `aggregate` ve `groupBy`; aylık grafikler için zaman dilimi açıkça tanımlanmış SQL toplaması; kâr için ürün bazında toplu SQL; kritik stok için veritabanında `stockQuantity <= minimumStockLevel` koşulu. Kâr toplamı tam veri üzerinden hesaplanmalı, ayrıntı listesi sunucuda sayfalanmalı. Sonraki ölçüm ihtiyaç gösterirse dönemsel özet tabloları değerlendirilebilir. [Prisma 6 toplama ve gruplama](https://www.prisma.io/docs/orm/v6/prisma-client/queries/aggregation-grouping-summarizing)

Sonuç eşitliği şartları: kayıtlı `unitCost`, kalem iskontosu, iptal durumu ve `stockPosted` filtresi korunmalı. Para hesabı Decimal/numeric olarak yapılmalı. Türkiye saat dilimi ve ay sınırları belirlenmeli. Mevcut sistemin bu ay hareket yoksa en son hareket ayına dönmesi korunmalı veya ayrı bir ürün kararıyla değiştirilmeli. Sadece daha az sorgu çalıştırmak finansal sonuç değiştirmemeli.

## 6. İndeks adayları

Kanıt: `prisma/schema.prisma` ve mevcut migration dosyaları. Faturalarda `(type, status)` var; tarih alanına özel indeks yok. Gider tarihi, stokta `(productId, movementAt)`, sohbette `(conversationId, createdAt)` zaten indeksli.

| Sorgu | İncelenecek indeks adayı | Karar için gereken kanıt |
| --- | --- | --- |
| Tür + fatura tarihi aralığı | `Invoice(type, invoiceDate)` | Tarih raporunun gerçek yürütme planı |
| Son faturalar / son faaliyet tarihi | `Invoice(invoiceDate)` | Filtresiz tarih sıralamasının maliyeti |
| Son siparişler | `SalesOrder(createdAt, id)`, `PurchaseOrder(createdAt, id)` | Yeni sayfalama sorguları ve veri büyüklüğü |
| Aktif ürünleri ada göre listeleme | `Product(isActive, name, id)` | Yeni filtreleme ve sıralama davranışı |
| Bütün stok hareketlerini tarihe göre listeleme | `StockMovement(movementAt, id)` | Mevcut ürünle başlayan indeksin bu sorguya etkisi |

Bunlar birlikte uygulanacak hazır bir migration listesi değildir. Bileşik B-tree indekslerinde kolon sırası sorguya göre önemlidir; her indeks yazma ve depolama maliyeti de getirir. Gerçek SQL üzerinde `EXPLAIN (ANALYZE, BUFFERS)` ile önce/sonra değerlendirme yapılmalı. [PostgreSQL 16 bileşik indeksler](https://www.postgresql.org/docs/16/indexes-multicolumn.html), [EXPLAIN rehberi](https://www.postgresql.org/docs/16/using-explain.html)

Sunucu aramasında `%kelime%` araması darboğaz çıkarsa `pg_trgm` incelenebilir. Ürün kodunun mevcut unique indeksi veya standart ad B-tree indeksi bütün alt metin aramalarını otomatik hızlandırmaz. Kısa aramalar ve Türkçe eşleşme davranışı ayrıca ölçülmeli. [PostgreSQL 16 trigram araması](https://www.postgresql.org/docs/16/pgtrgm.html)

## 7. Önbellek ancak güncellik akışı tamamlandıktan sonra

Kanıt: `src/services/settings-service.ts:5`, `src/app/_shared/revalidation.ts`, ürün/müşteri/ödeme action dosyaları.

Ayar servisindeki React `cache`, Server Component render'ında tekrar eden işi paylaşabilir; sonraki sunucu istekleri için kalıcı önbellek değildir. [React cache](https://react.dev/reference/react/cache)

Next.js 15 `unstable_cache`, pahalı sorgu sonuçlarını istekler arasında saklamayı, süre ve etiketlerle geçersiz kılmayı destekler. Başlangıç önerisi: yalnızca uygun rapor verileri için 30–60 saniyelik süre ve değişiklik sonrası etiket invalidasyonu. Oturum/yetki kontrolü cache dışında kalmalı; görünürlüğü etkileyen kullanıcı/rol ve gelecekte şirket kapsamı anahtara katılmalı. Ayarların görüntü alanları ayrılmalı; fatura sayacı gibi değişken iş verileri bu görüntü önbelleğine konmamalı. [Next.js 15 unstable_cache](https://nextjs.org/docs/15/app/api-reference/functions/unstable_cache)

Mevcut ödeme action'ı dashboard/rapor yollarını invalidasyon kapsamına almıyor. Ürün action'ları dashboard'u içeriyor fakat raporları içermiyor; müşteri action'ları müşteri yollarıyla sınırlı. Kalıcı cache eklenirse bütün satış, satın alma, stok, gider, ödeme, müşteri ve ürün değişiklikleri için ilgili rapor invalidasyonu tamamlanmalı. Eksik kapsam mevcut durumda ölçülmüş bayat veri hatası olarak ileri sürülmüyor; cache eklemenin önkoşulu olarak belirtiliyor.

## 8. Tarayıcı yükü ve algılanan hız

Sohbet bileşeni ortak navigasyon kabuğuna doğrudan import ediliyor; Recharts dashboard içinde kullanılıyor. `loading.tsx` iskeletleri zaten var. Paket büyüklükleri ve tarayıcı ana iş parçacığı süresi bu çalışmada ölçülmedi.

Öneri: üretim paket analizi sonrası sohbetin ağır panelini açıldığında yüklemek; gerekirse grafikleri uygun Client Component sınırında dinamik yüklemek. Next.js 15'te Server Component içinden Client Component'i dinamik import etmek otomatik kod bölünmesini her durumda sağlamaz; uygulanacak sınır buna göre seçilmeli. [Next.js 15 lazy loading](https://nextjs.org/docs/15/app/guides/lazy-loading)

Dashboard'un kartları, grafik ve kâr tablosu aynı büyük rapor fonksiyonunu bekliyor. Ayrı veri fonksiyonları ve Suspense sınırları kartların önce görünmesini sağlayabilir. Bu algılanan hızı iyileştirir; toplam SQL maliyetini azaltmanın yerine geçmez.

## Uygulama ve doğrulama planı

1. Production karşılaştırması: dashboard, ürünler, satışlar, raporlar ve yeni sipariş için ilk açılış ve sıcak gezinmeyi ölç. Sohbet açık/kapalı durumlarını ayır.
2. Genel gezinme paketi: sohbet verisini böl; satış/ürün listesinde dar sorgu ve sunucu sayfalaması uygula; form seçeneklerini ayır. Önce bu paketin etkisini karşılaştır.
3. Rapor paketi: toplamları ve kritik stok koşulunu veritabanına taşı; mevcut finansal sonuçlarla eşitliği doğrula.
4. SQL ve cache paketi: yeni sorguların planlarından gerekli indeksleri seç; invalidasyon akışını tamamla; sonra cache ekle.
5. Tarayıcı paketi: üretim paket analizinin gösterdiği ağır bileşenleri ihtiyaç anında yükle; tarayıcı ölçümünü tekrar et.

Ölçüm kayıtları: p50/p95 ekran hazır olma ve gezinme süreleri, sunucu istek süresi, gerçek SQL sayısı/süresi, dönen kayıt sayısı, RSC/ağ yanıt boyutu, tarayıcı etkileşim gecikmesi ve Node bellek kullanımı. p50/p95 için yeterli tekrar yapılmalı; tek ilk açılış ayrı raporlanmalı. SQL parametreleri veya kişisel veriler loglara eklenmeden süre/metrik kaydı tasarlanmalı. `pg_stat_statements` kurulu ve yapılandırılmışsa toplam SQL yükünü incelemek için kullanılabilir. [PostgreSQL 16 pg_stat_statements](https://www.postgresql.org/docs/16/pgstatstatements.html)

Anlamlı doğrulamalar: Türkçe arama ve sayfalar arası kayıt kaybı/tekrarı; satış onayı/iptali; stok tutarlılığı; ödeme sonrası rapor güncelliği; kâr hesabında iskonto ve maliyet; rol değişimi ve pasif kullanıcı erişimi. Kod değişikliklerinden sonra projenin `lint`, `test` ve `build` kontrolleri çalıştırılmalı. Hacim denemeleri ayrı test veritabanında yapılmalı; mevcut yıkıcı seed ölçüm hazırlığı olarak kullanılmamalı.

## Şimdilik sonraya bırakılacak seçenekler

Redis, PgBouncer, mikroservis ayrımı, kapsamlı React memoizasyonu ve büyük sürüm geçişleri ilk adım olarak gerekçelendirilmedi. Prisma zaten ortak client üzerinden kullanılıyor ve bağımsız pek çok sorgu paralel çalışıyor. Önce dönen veriyi ve tekrar eden işi azaltmak daha doğrudan bir müdahale. Bağlantı havuzu veya barındırma yatırımı ancak eşzamanlı kullanım ölçümleri ihtiyaç gösterirse ele alınmalı. [Prisma 6 sorgu optimizasyonu](https://www.prisma.io/docs/orm/v6/prisma-client/queries/query-optimization-performance)
