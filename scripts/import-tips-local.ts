/**
 * Jaxtina IELTS v2 - Local Tips Importer (Vietnamese edition)
 *
 * Imports curated IELTS Writing tips in Vietnamese, extracted from:
 * "The Complete Solution IELTS Writing" - ZIM IELTS Academy (2020)
 *
 * Run with:  npm run import-tips
 * (Upserts by title — safe to re-run to update existing records)
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// Load env vars
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const eqIdx = line.indexOf('=')
    if (eqIdx < 1) continue
    const key = line.slice(0, eqIdx).trim()
    const val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && val) process.env[key] = val
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. Check .env.local.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

interface TipToInsert {
  category:     string
  title:        string
  content:      string
  source_url:   string | null
  source_title: string
  task_filter:  number | null
  topic_tag:    string
}

const SOURCE = 'ZIM IELTS Academy - The Complete Solution IELTS Writing (2020)'

const TIPS: TipToInsert[] = [

  // ─── TASK 1: CẤU TRÚC ───────────────────────────────────────────────────────

  {
    category: 'Task 1 Structure',
    title: 'Task 1: Quy tắc chung & Quản lý thời gian',
    task_filter: 1,
    topic_tag: 'task_achievement',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Thời gian: Tối đa 20 phút**\n' +
      'Task 1 chỉ chiếm 1/3 điểm bài thi Writing. Task 2 chiếm 2/3, vì vậy hãy phân bổ thời gian hợp lý.\n\n' +
      '**Số từ: 150-200 từ**\n' +
      'Bạn phải viết tối thiểu 150 từ. Hướng tới 170-200 từ — viết quá nhiều sẽ tốn thời gian mà không tăng điểm.\n\n' +
      '**Quy tắc quan trọng:**\n' +
      '- KHÔNG đưa ra ý kiến cá nhân hoặc thông tin không có trong biểu đồ.\n' +
      '- CHỈ CHỌN những đặc điểm nổi bật nhất — không liệt kê tất cả số liệu.\n' +
      '- SO SÁNH và đối chiếu khi phù hợp (ví dụ: cao nhất vs. thấp nhất, thay đổi lớn nhất).\n' +
      '- Đa dạng từ vựng và cấu trúc câu để tăng điểm Lexical Resource và Grammar.\n\n' +
      '**4 bước làm bài:**\n' +
      '1. Phân tích biểu đồ (xác định đối tượng, đơn vị, thời gian)\n' +
      '2. Viết Introduction (paraphrase đề bài)\n' +
      '3. Viết Overview (2 đặc điểm nổi bật nhất)\n' +
      '4. Viết Details (2 đoạn thân bài với số liệu cụ thể)',
  },

  {
    category: 'Task 1 Structure',
    title: 'Task 1: Cách viết Introduction',
    task_filter: 1,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Quy tắc:** Paraphrase (viết lại) câu đề bài — KHÔNG sao chép nguyên văn.\n\n' +
      '**Các cụm từ mở bài thông dụng:**\n' +
      '- The chart/graph/table **illustrates** / **describes** / **demonstrates**...\n' +
      '- The diagram **shows** / **presents** / **compares**...\n' +
      '- The pie charts **compare** the proportion of...\n\n' +
      '**Nội dung cần có trong Introduction:**\n' +
      '- Đối tượng được đo lường (chủ ngữ)\n' +
      '- Đơn vị đo (%, nghìn, tấn, v.v.)\n' +
      '- Khoảng thời gian (nếu có)\n\n' +
      '**Ví dụ:**\n' +
      '- "The line graph **illustrates** changes in the number of cars per household in Great Britain over a period of 40 years."\n' +
      '- "The bar chart **describes** the proportion of males and females participating in popular sports in Britain in 2008."\n' +
      '- "The table **illustrates** the share of expenditure for three categories in five countries in 2002."\n\n' +
      '**Paraphrase bằng các từ đồng nghĩa:**\n' +
      '- chart / graph / figure / diagram / visual\n' +
      '- shows / illustrates / presents / describes / demonstrates / compares\n' +
      '- between 1990 and 2010 / over a 20-year period / from 1990 to 2010',
  },

  {
    category: 'Task 1 Structure',
    title: 'Task 1: Cách viết Overview',
    task_filter: 1,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Overview là đoạn quan trọng nhất trong Task 1.**\n' +
      'Tóm tắt 2-3 đặc điểm nổi bật nhất của biểu đồ — KHÔNG ghi số liệu cụ thể trong đoạn này.\n\n' +
      '**Cụm từ mở đầu Overview thường dùng:**\n' +
      '- "Overall, it is clear that..."\n' +
      '- "In general, it can be seen that..."\n' +
      '- "It is noticeable that..."\n' +
      '- "As an overview..."\n\n' +
      '**Nội dung cần đề cập:**\n' +
      '- Xu hướng lớn nhất (nhóm nào cao nhất / thấp nhất)\n' +
      '- Sự thay đổi nổi bật nhất (nhóm nào thay đổi nhiều nhất)\n' +
      '- Sự tương phản rõ ràng giữa các nhóm\n\n' +
      '**Ví dụ mẫu:**\n' +
      '- "Overall, it is clear that while the percentages of one-car and two-car households increased, the opposite is true for no-car households."\n' +
      '- "In general, Nuclear was by far the most popular source of electricity production over the period."\n' +
      '- "As can be seen from the plans, the health centre witnessed dramatic changes both outdoors and indoors."\n\n' +
      '**Lỗi thường gặp:** Ghi số liệu cụ thể vào Overview — hãy để số liệu cho phần Details.',
  },

  {
    category: 'Task 1 Structure',
    title: 'Task 1: Phương pháp 4 bước cho mọi dạng biểu đồ',
    task_filter: 1,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Bước 1: Phân tích biểu đồ**\n' +
      'Xác định: đối tượng (đo lường gì?), đơn vị (%, triệu, tấn?), thời gian, số nhóm, và các đặc điểm nổi bật nhất.\n\n' +
      '**Bước 2: Introduction**\n' +
      'Paraphrase câu đề bài. Nêu biểu đồ thể hiện điều gì mà không sao chép nguyên văn.\n\n' +
      '**Bước 3: Overview**\n' +
      'Viết 2-3 câu về đặc điểm nổi bật nhất. Không ghi số liệu cụ thể ở đây.\n\n' +
      '**Bước 4: Details (2 đoạn thân bài)**\n' +
      'Nhóm thông tin theo logic:\n' +
      '- Biểu đồ đường/cột: nhóm theo khoảng thời gian HOẶC theo danh mục\n' +
      '- Biểu đồ tròn: nhóm giá trị cao với nhau, giá trị thấp với nhau\n' +
      '- Bản đồ: nhóm theo vị trí (bắc/nam, trong/ngoài tòa nhà)\n' +
      '- Quy trình: mô tả từng giai đoạn theo thứ tự\n\n' +
      '**Từ nối cho quy trình:**\n' +
      'First / Initially -> After that / Then / Subsequently / Following this -> Finally\n\n' +
      '**Từ nối cho so sánh:**\n' +
      'In contrast / On the other hand / Meanwhile / Whereas / While / Similarly / Likewise',
  },

  // ─── TỪ VỰNG ────────────────────────────────────────────────────────────────

  {
    category: 'Vocabulary',
    title: 'Từ vựng mô tả xu hướng: Động từ & Danh từ (Task 1)',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Xu hướng tăng:**\n' +
      '- Động từ: increase, rise, grow, go up, climb, surge, soar, rocket\n' +
      '- Danh từ: an increase, a rise, growth, an upward trend\n\n' +
      '**Xu hướng giảm:**\n' +
      '- Động từ: decrease, decline, fall, drop, plunge, dip\n' +
      '- Danh từ: a decrease, a decline, a fall, a drop, a downward trend\n\n' +
      '**Duy trì ổn định:**\n' +
      '- Động từ: remain stable, stay unchanged, level off, stabilise, plateau\n' +
      '- Danh từ: stability, a plateau\n\n' +
      '**Dao động:**\n' +
      '- Động từ: fluctuate, vary\n' +
      '- Danh từ: a fluctuation, variation\n\n' +
      '**Đạt đỉnh / Chạm đáy:**\n' +
      '- Đỉnh: reach a peak / hit the highest point / peak at [giá trị]\n' +
      '- Đáy: hit a low / hit the lowest point / reach a trough / bottom out\n\n' +
      '**Ví dụ câu mẫu:**\n' +
      '- "The number of students **rose steadily** from 1,500 to 2,000."\n' +
      '- "Sales **fluctuated** throughout the period before **levelling off** at $3 million."\n' +
      '- "Electricity production from nuclear **peaked at** nearly 430 TWh in 2005."',
  },

  {
    category: 'Vocabulary',
    title: 'Mức độ thay đổi: Tính từ & Trạng từ (Task 1)',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Thay đổi nhỏ / từ từ:**\n' +
      '- Tính từ: slight, marginal, moderate, gradual, slow, steady\n' +
      '- Trạng từ: slightly, marginally, moderately, gradually, slowly, steadily\n\n' +
      '**Thay đổi lớn / nhanh:**\n' +
      '- Tính từ: considerable, significant, substantial, dramatic, sharp, rapid, steep\n' +
      '- Trạng từ: considerably, significantly, substantially, dramatically, sharply, rapidly\n\n' +
      '**Cách dùng:**\n' +
      '- Động từ + trạng từ: "Sales **increased significantly**."\n' +
      '- There + was + mạo từ + tính từ + danh từ: "There was a **significant increase** in sales."\n' +
      '- Chủ ngữ + experienced/witnessed + danh từ: "Sales **witnessed a dramatic rise**."\n\n' +
      '**Ví dụ:**\n' +
      '- "The unemployment rate **fell slightly** from 8% to 7.5%."\n' +
      '- "There was a **dramatic surge** in online shopping between 2010 and 2020."\n' +
      '- "The figure for renewable energy **rose steadily** over the decade."\n' +
      '- "Exports **dropped sharply** by $2 million in 2008."',
  },

  {
    category: 'Vocabulary',
    title: 'Giới từ với số liệu: at / to / by / of',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**at** — chỉ mức giá trị cố định tại một thời điểm:\n' +
      '- stand at: "The crime rate **stood at** 5% in 2000." (đứng ở mức 5%)\n' +
      '- remain stable at: "Exports **remained stable at** $15 million."\n' +
      '- peak at: "Production **peaked at** 10,000 units." (đạt đỉnh ở mức)\n\n' +
      '**to** — chỉ giá trị đích sau khi thay đổi:\n' +
      '- increase/decrease to: "Students **increased to** 10,000." (tăng lên đến 10,000)\n' +
      '- There was an increase **to** 10,000 in student numbers.\n\n' +
      '**by** — chỉ lượng thay đổi:\n' +
      '- increase/decrease by: "Sales **increased by** 2,000 units." (tăng thêm 2,000)\n\n' +
      '**of** — dùng với danh từ để chỉ lượng thay đổi hoặc giá trị đỉnh/đáy:\n' +
      '- an increase of: "There was an increase **of** 2,000 in student numbers."\n' +
      '- reach a peak of: "Production **reached a peak of** 10,000 units."\n' +
      '- hit a low of: "Exports **hit a low of** $1.5 million in 2009."\n\n' +
      '**Tóm tắt nhanh:**\n' +
      '- Từ 5,000 lên 7,000: increased **by** 2,000 / increased **to** 7,000\n' +
      '- Giá trị cao nhất là 7,000: peaked **at** 7,000 / reached a peak **of** 7,000',
  },

  {
    category: 'Vocabulary',
    title: '5 Cấu trúc ngữ pháp để mô tả sự thay đổi số liệu',
    task_filter: 1,
    topic_tag: 'grammar',
    source_url: null,
    source_title: SOURCE,
    content:
      'Sử dụng 5 cấu trúc này để bài viết đa dạng hơn. Tất cả đều diễn đạt cùng một thông tin.\n' +
      '**Ví dụ số liệu: Số học sinh tăng từ 1,500 lên 2,000 năm 2016 (tăng 500 em).**\n\n' +
      '**Cấu trúc 1** — Chủ ngữ + Động từ + Trạng từ + Số liệu + Thời gian:\n' +
      '"The number of students **increased significantly to 2,000 in 2016**."\n\n' +
      '**Cấu trúc 2** — There + be + Mạo từ + Tính từ + Danh từ + Số liệu + Thời gian:\n' +
      '"There was **a significant increase of 500** in the number of students **in 2016**."\n\n' +
      '**Cấu trúc 3** — Chủ ngữ + experienced/witnessed + Tính từ + Danh từ:\n' +
      '"The number of students **witnessed a significant increase of 500 in 2016**."\n\n' +
      '**Cấu trúc 4** — Mạo từ + Tính từ + Danh từ + was seen + in Chủ ngữ:\n' +
      '"**A significant increase of 500 was seen** in the number of students in 2016."\n\n' +
      '**Cấu trúc 5** — Thời gian + witnessed + Tính từ + Danh từ + in Cụm danh từ:\n' +
      '"**The year 2016 witnessed a significant increase of 500** in student numbers."\n\n' +
      '**Mẹo:** Luân phiên giữa các cấu trúc này trong bài Task 1 để tăng điểm Grammar.',
  },

  {
    category: 'Vocabulary',
    title: 'Ngôn ngữ so sánh trong Task 1',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**So sánh hai giá trị cùng thời điểm:**\n' +
      '- "X was [giá trị], **compared with** Y at [giá trị]."\n' +
      '- "X accounted for [giá trị], **while/whereas** Y made up [giá trị]."\n' +
      '- "X was **twice as much as** Y." / "X was **half of** Y."\n' +
      '- "X was **significantly/slightly higher/lower than** Y."\n\n' +
      '**Tránh lặp danh từ — dùng "the figure for X" hoặc "that of X":**\n' +
      '- "The unemployment rate in Vietnam was 10%, while **the figure for** the US was 12%."\n' +
      '- "Canada\'s housing expenditure was 14%, compared to **that of** the US at 26%."\n\n' +
      '**Thể hiện sự vượt trội:**\n' +
      '- "X was **by far the most** popular..."\n' +
      '- "X accounted for **the largest proportion** of..."\n\n' +
      '**Thể hiện sự tương đồng:**\n' +
      '- "The figures for X and Y were **relatively similar**, at around 6%."\n' +
      '- "Both X and Y experienced **comparable** trends."\n\n' +
      '**Ví dụ câu mẫu:**\n' +
      '"In 2008, approximately 25% of men played football, **compared with** only 5% of women. The figures for tennis were **relatively similar**, **at around** 6% for both sexes."',
  },

  {
    category: 'Vocabulary',
    title: 'Ngôn ngữ mô tả Bản đồ & Vị trí (Task 1)',
    task_filter: 1,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Mô tả vị trí:**\n' +
      '- to the north/south/east/west of... (về phía bắc/nam/đông/tây)\n' +
      '- in the north-eastern/south-western corner (ở góc đông bắc/tây nam)\n' +
      '- in the centre/middle of... (ở trung tâm/giữa)\n' +
      '- on the left/right-hand side (ở phía trái/phải)\n' +
      '- adjacent to / next to / beside / opposite (liền kề / bên cạnh / đối diện)\n\n' +
      '**Mô tả sự thay đổi trên bản đồ:**\n' +
      '- has been **constructed/built/added** (được xây dựng/thêm vào)\n' +
      '- has been **demolished/removed/knocked down** (bị phá dỡ/tháo dỡ)\n' +
      '- has been **converted into / transformed into** (được chuyển đổi thành)\n' +
      '- has been **extended/expanded/enlarged** (được mở rộng)\n' +
      '- has been **relocated to** the [hướng] (được dời đến)\n' +
      '- was **replaced by** a new [công trình] (được thay thế bởi)\n\n' +
      '**Paraphrase các đối tượng trên bản đồ:**\n' +
      '- countryside -> rural area (vùng nông thôn)\n' +
      '- shopping centre -> shopping mall / shopping complex\n' +
      '- housing -> accommodation / residential area (khu dân cư)\n' +
      '- pedestrians only -> pedestrian precinct (khu vực dành cho người đi bộ)\n\n' +
      '**Công thức Introduction cho bản đồ:**\n' +
      '"The two maps describe a number of changes which took place in [địa điểm] between [năm] and [năm]."',
  },

  // ─── TASK 2: LẬP LUẬN ───────────────────────────────────────────────────────

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: Quy tắc chung & Các lỗi thường gặp',
    task_filter: 2,
    topic_tag: 'task_achievement',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Thời gian: 40 phút | Số từ: tối thiểu 250 (hướng tới 260-300)**\n' +
      'Task 2 chiếm 2/3 điểm Writing — hãy ưu tiên phần này.\n\n' +
      '**Quy tắc quan trọng:**\n' +
      '- KHÔNG sử dụng từ viết tắt (ví dụ: "govt" thay cho "government").\n' +
      '- KHÔNG dùng ngôn ngữ thông thường hoặc tiếng lóng.\n' +
      '- KHÔNG sao chép câu từ đề bài — giám khảo sẽ không tính những câu đó.\n' +
      '- Viết 4 đoạn văn: Introduction + 2 Body paragraphs + Conclusion.\n' +
      '- Hạn chế thành ngữ — chúng thường nghe không tự nhiên trong văn viết.\n\n' +
      '**Đối tượng đọc là người không chuyên ngành.**\n' +
      'Chủ đề thường về: du lịch, sức khỏe, giáo dục, môi trường, các vấn đề xã hội, công nghệ.\n\n' +
      '**Bạn ĐƯỢC PHÉP (và thường được yêu cầu) nêu ý kiến cá nhân.**\n' +
      'Có thể dùng ví dụ từ kinh nghiệm bản thân để minh họa luận điểm.\n\n' +
      '**Các lỗi phổ biến cần tránh:**\n' +
      '- Viết dưới 250 từ — bị trừ điểm tự động\n' +
      '- Lạc đề — hãy đọc lại câu hỏi trước khi viết kết luận\n' +
      '- Chỉ viết một đoạn thân bài — luôn phải có hai đoạn\n' +
      '- Không nêu rõ quan điểm trong phần mở bài',
  },

  {
    category: 'Task 2 Argument Development',
    title: '5 Dạng đề Task 2 thường gặp trong IELTS',
    task_filter: 2,
    topic_tag: 'task_achievement',
    source_url: null,
    source_title: SOURCE,
    content:
      '**1. Opinion (Agree/Disagree) — Đồng ý / Không đồng ý**\n' +
      'Câu hỏi: "Do you agree or disagree?" hoặc "To what extent do you agree or disagree?"\n' +
      'Chiến lược: Nêu rõ quan điểm ngay từ đầu và bảo vệ quan điểm đó xuyên suốt bài.\n' +
      'Ví dụ: "Everyone should stay at school until 18. To what extent do you agree?"\n\n' +
      '**2. Discussion (Both Views) — Thảo luận hai quan điểm**\n' +
      'Câu hỏi: "Discuss both views and give your own opinion."\n' +
      'Chiến lược: Trình bày CẢ HAI phía, sau đó đưa ra kết luận cá nhân.\n\n' +
      '**3. Advantages & Disadvantages — Lợi và hại**\n' +
      'Câu hỏi: "Do the advantages outweigh the disadvantages?" hoặc "Is this a positive or negative development?"\n' +
      'Chiến lược: Phân tích cả hai mặt, kết luận rõ ràng về bên nào lớn hơn.\n\n' +
      '**4. Cause & Solution (hoặc Cause & Effect) — Nguyên nhân & Giải pháp**\n' +
      'Câu hỏi: "What are the causes of this problem and what solutions can be suggested?"\n' +
      'Chiến lược: Một đoạn về nguyên nhân, một đoạn về giải pháp/hệ quả.\n\n' +
      '**5. Direct Question — Câu hỏi trực tiếp (hai phần)**\n' +
      'Câu hỏi: Hai câu hỏi riêng biệt về cùng một chủ đề.\n' +
      'Chiến lược: Trả lời CẢ HAI câu hỏi — mỗi câu một đoạn thân bài.',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: Cấu trúc bài luận 4 đoạn',
    task_filter: 2,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Đoạn 1 — Introduction (2-3 câu):**\n' +
      '- Câu 1: Paraphrase chủ đề (giới thiệu vấn đề)\n' +
      '- Câu 2: Nêu quan điểm hoặc cho biết bài sẽ thảo luận điều gì\n\n' +
      '**Đoạn 2 — Body Paragraph 1 (4-6 câu):**\n' +
      '- Topic sentence: nêu ý chính của đoạn\n' +
      '- Ý phụ 1 + chi tiết hoặc ví dụ minh họa\n' +
      '- Ý phụ 2 + chi tiết hoặc ví dụ minh họa\n\n' +
      '**Đoạn 3 — Body Paragraph 2 (4-6 câu):**\n' +
      '- Topic sentence: ý chính thứ hai (hoặc quan điểm đối lập)\n' +
      '- Ý phụ 1 + chi tiết hoặc ví dụ minh họa\n' +
      '- Ý phụ 2 + chi tiết hoặc ví dụ minh họa\n\n' +
      '**Đoạn 4 — Conclusion (1-2 câu):**\n' +
      '- Tái khẳng định quan điểm bằng ngôn từ khác\n' +
      '- Tóm tắt ngắn gọn các lý do chính (tùy chọn)\n\n' +
      '**Cấu trúc PEEL cho mỗi đoạn thân bài:**\n' +
      '- **P**oint — topic sentence (luận điểm)\n' +
      '- **E**xplain — giải thích tại sao / như thế nào\n' +
      '- **E**vidence — ví dụ, bằng chứng, hoặc lý do cụ thể\n' +
      '- **L**ink — kết nối trở lại câu hỏi đề bài\n\n' +
      '**Ví dụ:**\n' +
      'Topic sentence: "On the one hand, playing video games has some advantages."\n' +
      'Hỗ trợ: "Firstly, games help players relax and improve work efficiency. This is especially important for students dealing with increasing workloads today."',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: Cách viết Introduction',
    task_filter: 2,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Mục đích:** Giới thiệu chủ đề và nêu quan điểm của bạn. Chỉ cần 2-3 câu.\n\n' +
      '**Cấu trúc:**\n' +
      '1. Paraphrase câu đề bài (KHÔNG sao chép nguyên văn)\n' +
      '2. Nêu quan điểm hoặc cho biết bạn sẽ thảo luận điều gì\n\n' +
      '**Ví dụ đề bài:** "Government should invest more in science education. Do you agree or disagree?"\n\n' +
      '**Ví dụ Introduction:**\n' +
      '"It is said that government funding should give preference to science-based subjects in an attempt to boost national development. Although an increase in scientific developments can have many benefits, **this essay disagrees that science is the primary contributor**."\n\n' +
      '**Cụm từ nêu quan điểm:**\n' +
      '- "This essay **agrees/disagrees** that..."\n' +
      '- "I **strongly believe** that..." / "I **partially agree** that..."\n' +
      '- "**In my view,** the advantages of X **outweigh** the disadvantages."\n\n' +
      '**Cụm từ cho dạng thảo luận:**\n' +
      '- "There are compelling arguments on both sides of this debate."\n' +
      '- "This essay will discuss both perspectives before reaching a conclusion."\n\n' +
      '**Paraphrase từ vựng trong đề:**\n' +
      '- government -> authorities / policymakers / the state\n' +
      '- invest -> allocate / spend / channel funding into\n' +
      '- important -> vital / crucial / essential / significant',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Task 2: Cách viết Conclusion',
    task_filter: 2,
    topic_tag: 'structure',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Mục đích:** Tái khẳng định quan điểm và tóm tắt. Chỉ cần 1-2 câu.\n\n' +
      '**Quy tắc:** KHÔNG đưa ra ý tưởng mới trong phần kết luận.\n\n' +
      '**Cụm từ mở đầu kết luận:**\n' +
      '- "In conclusion,..."\n' +
      '- "To conclude,..."\n' +
      '- "In summary,..."\n' +
      '- "To summarise,..."\n\n' +
      '**Ví dụ:**\n' +
      '- "In conclusion, playing video games is both advantageous and disadvantageous. In my view, the extent to which each user is affected depends largely on how much time they spend on games."\n' +
      '- "To conclude, although science has led to many benefits, it is not the sole contributor to national progress. Governments should invest equally across all subjects."\n' +
      '- "In summary, the disadvantages of video games outweigh the advantages for most players."\n\n' +
      '**Dạng Opinion:** Tái khẳng định quan điểm ban đầu bằng từ ngữ khác.\n' +
      '**Dạng Discussion:** Nêu rõ quan điểm nào thuyết phục hơn và tại sao.\n' +
      '**Dạng Advantages/Disadvantages:** Kết luận bên nào lớn hơn.',
  },

  {
    category: 'Task 2 Argument Development',
    title: 'Kỹ thuật Paraphrase cho IELTS Writing',
    task_filter: null,
    topic_tag: 'vocabulary',
    source_url: null,
    source_title: SOURCE,
    content:
      'Paraphrase (viết lại) là kỹ năng thiết yếu cho phần Introduction và để tránh lặp từ trong bài.\n\n' +
      '**Kỹ thuật 1 — Từ đồng nghĩa (Synonyms):**\n' +
      '- government -> authorities / policymakers / the state / national leaders\n' +
      '- support -> help / aid / assist / provide assistance for\n' +
      '- important -> vital / crucial / essential / significant\n' +
      '- local businesses -> local companies / small enterprises / domestic firms\n\n' +
      '**Kỹ thuật 2 — Đổi dạng câu (Passive/Active):**\n' +
      '- "The government should support local businesses."\n' +
      '  -> "Local companies should be assisted by the authorities."\n\n' +
      '**Kỹ thuật 3 — Đổi dạng từ (Word form):**\n' +
      '- support (v) -> support/assistance (n) -> supportive (adj)\n' +
      '- "The authorities should provide support for local companies."\n\n' +
      '**Kỹ thuật 4 — Chủ ngữ giả (It / There):**\n' +
      '- "It is necessary/vital for the authorities to assist local companies."\n' +
      '- "There is growing concern that local businesses need more support."\n\n' +
      '**Kỹ thuật 5 — Định nghĩa / Mở rộng:**\n' +
      '- government -> "those who lead the nation" / "national policymakers"\n' +
      '- exercise -> "physical training" / "regular physical activity"\n\n' +
      '**Luyện tập:** Viết lại câu sau bằng 3 kỹ thuật khác nhau:\n' +
      '"Many people believe that exercise is essential for good health."',
  },

  // ─── NGỮ PHÁP ────────────────────────────────────────────────────────────────

  {
    category: 'Grammar',
    title: '4 Tiêu chí chấm điểm IELTS Writing',
    task_filter: null,
    topic_tag: 'grammar',
    source_url: null,
    source_title: SOURCE,
    content:
      'Điểm IELTS Writing được tính từ **4 tiêu chí bằng nhau** (mỗi tiêu chí 25%):\n\n' +
      '**1. Task Achievement / Task Response (TR)**\n' +
      '- Bạn có trả lời ĐẦY ĐỦ tất cả các phần của đề bài không?\n' +
      '- Quan điểm của bạn có rõ ràng và nhất quán không?\n' +
      '- Các ý có liên quan, được phát triển tốt và có ví dụ minh họa không?\n\n' +
      '**2. Coherence & Cohesion (CC) — Mạch lạc & Liên kết**\n' +
      '- Thông tin có được sắp xếp logic không?\n' +
      '- Bạn có sử dụng cohesive devices (từ nối) chính xác và hiệu quả không?\n' +
      '- Mỗi đoạn văn có đi theo một ý chính không?\n\n' +
      '**3. Lexical Resource (LR) — Vốn từ vựng**\n' +
      '- Bạn có sử dụng vốn từ phong phú, tự nhiên và chính xác không?\n' +
      '- Bạn có dùng các từ ít thông dụng hơn và ít mắc lỗi không?\n' +
      '- Lỗi chính tả và cấu tạo từ có được hạn chế tối thiểu không?\n\n' +
      '**4. Grammatical Range & Accuracy (GRA) — Ngữ pháp**\n' +
      '- Bạn có sử dụng đa dạng cấu trúc câu (đơn, ghép, phức) không?\n' +
      '- Lỗi ngữ pháp và dấu câu có hiếm gặp và không ảnh hưởng đến việc đọc hiểu không?\n\n' +
      '**Cách cải thiện từng tiêu chí:**\n' +
      '- TR: Luôn trả lời đúng câu hỏi được đặt ra; lên kế hoạch trước khi viết\n' +
      '- CC: Dùng topic sentence cho mỗi đoạn; đa dạng hóa từ nối\n' +
      '- LR: Học collocations và từ vựng theo chủ đề\n' +
      '- GRA: Luyện tập câu phức với mệnh đề quan hệ, câu điều kiện, thể bị động',
  },

  {
    category: 'Grammar',
    title: 'Từ nối & Cohesive Devices trong IELTS',
    task_filter: null,
    topic_tag: 'coherence',
    source_url: null,
    source_title: SOURCE,
    content:
      '**Bổ sung thông tin:**\n' +
      '- Furthermore / Moreover / In addition / Additionally / What is more\n\n' +
      '**Tương phản / Nhượng bộ:**\n' +
      '- However / Nevertheless / On the other hand / In contrast / Although / Despite / While / Whereas\n\n' +
      '**Nêu ví dụ:**\n' +
      '- For example / For instance / To illustrate / Such as / Including\n\n' +
      '**Nhân quả:**\n' +
      '- Therefore / As a result / Consequently / This leads to / This means that / Because of this\n\n' +
      '**Trình tự (đặc biệt cho quy trình và lập luận):**\n' +
      '- First / Initially -> Then / After that / Subsequently / Following this -> Finally / Lastly\n\n' +
      '**Tóm tắt / Kết luận:**\n' +
      '- In conclusion / To conclude / Overall / In summary / To summarise\n\n' +
      '**Lỗi thường gặp:**\n' +
      '- KHÔNG bắt đầu mỗi câu bằng một từ nối — bài sẽ đọc rất cứng nhắc.\n' +
      '- KHÔNG dùng "Firstly, Secondly, Thirdly" cho các đoạn thân bài — chỉ dùng cho các luận điểm trong một đoạn.\n' +
      '- "However" phải được theo sau bởi dấu phẩy và bắt đầu một câu đầy đủ.\n' +
      '- "Although" mở đầu mệnh đề phụ:\n' +
      '  Đúng: "Although science is important, arts also contribute to development."\n' +
      '  Sai: "Although, science is important."',
  },

]

// ── Upsert tips by title (update if exists, insert if not) ───────────────────
async function upsertTip(tip: TipToInsert): Promise<'inserted' | 'updated' | 'failed'> {
  const { data: existing } = await supabase
    .from('tips')
    .select('id')
    .eq('title', tip.title)
    .limit(1)

  if (existing && existing.length > 0) {
    const { error } = await supabase
      .from('tips')
      .update({
        category:     tip.category,
        content:      tip.content,
        source_url:   tip.source_url,
        source_title: tip.source_title,
        task_filter:  tip.task_filter,
        topic_tag:    tip.topic_tag,
      })
      .eq('id', existing[0].id)

    if (error) { console.error('  Update failed: ' + error.message); return 'failed' }
    return 'updated'
  }

  const { error } = await supabase.from('tips').insert(tip)
  if (error) { console.error('  Insert failed: ' + error.message); return 'failed' }
  return 'inserted'
}

async function main() {
  console.log('\nUpsert ' + TIPS.length + ' mẹo IELTS (tiếng Việt)...\n')

  let inserted = 0
  let updated  = 0
  let failed   = 0

  for (const tip of TIPS) {
    const result = await upsertTip(tip)
    if (result === 'inserted') { console.log('  [mới]  ' + tip.title); inserted++ }
    if (result === 'updated')  { console.log('  [cập nhật]  ' + tip.title); updated++ }
    if (result === 'failed')   { failed++ }
  }

  console.log('\n-- Tổng kết --')
  console.log('  Mới      : ' + inserted)
  console.log('  Cập nhật : ' + updated)
  console.log('  Lỗi      : ' + failed)
  console.log('')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
