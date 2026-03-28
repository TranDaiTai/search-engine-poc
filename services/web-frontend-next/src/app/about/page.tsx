"use client";

import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, Leaf } from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function useCounter(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

// ── Data ───────────────────────────────────────────────────────────────────────

const STORY_CHAPTERS = [
  {
    year: "2021",
    title: "Khởi đầu từ một câu hỏi",
    body: "Chúng tôi bắt đầu bằng một câu hỏi đơn giản: Liệu có thể mua sắm thời trang mà không làm tổn hại đến thiên nhiên? Từ một căn phòng nhỏ ở Hà Nội, ba người sáng lập đã bắt đầu hành trình tìm kiếm câu trả lời.",
    image: "https://images.unsplash.com/photo-1604881989793-466aca8dd319?auto=format&fit=crop&w=900&q=80",
  },
  {
    year: "2022",
    title: "Xây dựng mạng lưới xanh",
    body: "Chúng tôi dành cả năm 2022 để kết nối với hơn 50 nhà cung cấp thuần chay và hữu cơ toàn quốc. Mỗi đối tác đều được kiểm định nghiêm ngặt về quy trình sản xuất, từ nguyên liệu đến đóng gói.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=900&q=80",
  },
  {
    year: "2023",
    title: "Ra mắt và tăng trưởng",
    body: "EcoMarket ra mắt phiên bản đầu tiên với 200 sản phẩm. Trong 6 tháng đầu, hơn 5.000 khách hàng đã tin tưởng lựa chọn chúng tôi. Mỗi đơn hàng đóng góp trực tiếp vào quỹ trồng cây của EcoMarket.",
    image: "https://images.unsplash.com/photo-1542601906897-57e8f8a9a1b9?auto=format&fit=crop&w=900&q=80",
  },
  {
    year: "2025",
    title: "Nâng tầm trải nghiệm",
    body: "Năm 2025 đánh dấu bước chuyển mình lớn: ra mắt nền tảng Premium với trải nghiệm mua sắm hoàn toàn mới, hệ thống đánh giá tác động carbon và chương trình thành viên Eco Elite.",
    image: "https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&w=900&q=80",
  },
];

const VALUES = [
  { n: "01", title: "Minh bạch tuyệt đối", desc: "Mọi sản phẩm đều có nguồn gốc rõ ràng, quy trình sản xuất được công khai. Không che giấu, không đánh lừa." },
  { n: "02", title: "Bền vững từ gốc rễ", desc: "Chúng tôi không chỉ bán hàng eco-friendly—chúng tôi sống và thở bền vững trong từng quyết định kinh doanh." },
  { n: "03", title: "Chất lượng vượt trội", desc: "Sản phẩm 'xanh' không có nghĩa là kém chất lượng. EcoMarket chứng minh điều ngược lại mỗi ngày." },
  { n: "04", title: "Cộng đồng trước tiên", desc: "Mọi lợi nhuận đều tái đầu tư vào cộng đồng: từ nông dân hữu cơ đến nghệ nhân thủ công địa phương." },
  { n: "05", title: "Đổi mới không ngừng", desc: "Thách thức hiện trạng, tìm kiếm giải pháp mới—đó là DNA của EcoMarket kể từ ngày đầu thành lập." },
];

const TEAM = [
  { name: "Minh Châu", role: "Co-Founder & CEO", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80" },
  { name: "Tuấn Anh", role: "Co-Founder & CTO", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80" },
  { name: "Linh Phương", role: "Head of Sustainability", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&q=80" },
  { name: "Đức Huy", role: "Creative Director", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80" },
];

const STATS = [
  { value: 5000, suffix: "+", label: "Khách hàng tin tưởng" },
  { value: 12, suffix: " tấn", label: "CO₂ đã tiết kiệm" },
  { value: 10000, suffix: "+", label: "Cây xanh đã trồng" },
  { value: 50, suffix: "+", label: "Nhà cung cấp eco" },
];

// ── Magnetic Button ────────────────────────────────────────────────────────────

function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className="inline-flex items-center gap-4 px-10 py-5 bg-primary text-white rounded-full font-bold text-sm uppercase tracking-[0.15em] shadow-xl hover:shadow-2xl hover:bg-accent transition-colors duration-300 cursor-pointer"
    >
      {children}
    </motion.a>
  );
}

// ── Story Carousel ─────────────────────────────────────────────────────────────
// Fully standalone: no scroll linking, no sticky. Prev/Next buttons + dot nav.
function StoryCarousel() {
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1); // 1 = forward, -1 = backward

  const go = (next: number) => {
    setDir(next > idx ? 1 : -1);
    setIdx(next);
  };
  const prev = () => go((idx - 1 + STORY_CHAPTERS.length) % STORY_CHAPTERS.length);
  const next = () => go((idx + 1) % STORY_CHAPTERS.length);

  const ch = STORY_CHAPTERS[idx];

  return (
    <section className="bg-white py-28">
      <div className="max-w-7xl mx-auto px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-600 mb-4">Hành trình</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Câu chuyện <span className="font-serif font-medium italic text-emerald-600">của chúng tôi</span>
            </h2>
          </div>
          {/* Prev / Next controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              aria-label="Trước"
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 active:scale-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <span className="text-xs font-bold text-primary/30 tracking-widest w-14 text-center">
              {String(idx + 1).padStart(2, "0")} / {String(STORY_CHAPTERS.length).padStart(2, "0")}
            </span>
            <button
              onClick={next}
              aria-label="Tiếp theo"
              className="w-12 h-12 rounded-full border border-gray-200 bg-white flex items-center justify-center text-primary hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 active:scale-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Slide area */}
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="grid md:grid-cols-2 gap-16 items-center"
            >
              {/* Text */}
              <div className="space-y-6 py-4">
                <span
                  className="block font-serif font-thin text-primary/8 leading-none"
                  style={{ fontSize: "clamp(72px, 10vw, 128px)" }}
                >
                  {ch.year}
                </span>
                <div className="w-12 h-px bg-emerald-500" />
                <h3 className="text-3xl md:text-4xl font-bold tracking-tight">{ch.title}</h3>
                <p className="text-lg text-primary/60 leading-relaxed font-medium max-w-md">{ch.body}</p>

                {/* Dot nav */}
                <div className="flex gap-2 pt-2">
                  {STORY_CHAPTERS.map((_, j) => (
                    <button
                      key={j}
                      onClick={() => go(j)}
                      aria-label={`Slide ${j + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-400 ${
                        j === idx ? "w-8 bg-emerald-500" : "w-2 bg-primary/15 hover:bg-primary/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="relative h-[420px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl">
                <img
                  src={ch.image}
                  alt={ch.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/8 rounded-3xl" />
                <div className="absolute bottom-5 left-5 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full">
                  <span className="text-white text-xs font-bold uppercase tracking-widest">
                    {ch.year}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ── Reveal wrapper ──────────────────────────────────────────────────────────────

const Reveal = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── StatCounter Component (hooks must not be called inside .map()) ────────────
function StatCounter({ value, suffix }: { value: number; suffix: string }) {
  const { count, ref } = useCounter(value);
  return (
    <p className="text-5xl md:text-6xl font-bold text-white mb-2">
      <span ref={ref}>{count.toLocaleString('vi-VN')}</span>
      <span className="text-emerald-400">{suffix}</span>
    </p>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  // Hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);


  return (
    <main className="min-h-screen" style={{ background: "#FDFCFB", color: "#111827" }}>
      <Navbar />

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative h-screen overflow-hidden flex items-end pb-24">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80"
            alt="Sustainable lifestyle hero"
            className="w-full h-[115%] object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-8 w-full"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/60 mb-6 flex items-center gap-3">
              <Leaf className="w-4 h-4 text-emerald-400" /> EcoMarket · Về chúng tôi
            </p>
            <h1 className="text-white leading-[1.05]">
              <span className="block text-6xl md:text-8xl font-bold tracking-tight">Sống tinh tế,</span>
              <span className="block text-6xl md:text-8xl font-serif font-medium italic text-emerald-300">bảo vệ hành tinh.</span>
            </h1>
            <p className="mt-8 text-white/70 text-xl font-medium italic max-w-xl leading-relaxed">
              Chúng tôi tin rằng sự sang trọng đích thực không bao giờ đến từ sự lãng phí.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 right-8 flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Cuộn xuống</span>
          <div className="w-px h-12 bg-white/30" />
        </motion.div>
      </section>

      {/* ── INTRO STATEMENT ── */}
      <section className="max-w-4xl mx-auto px-8 py-32 text-center">
        <Reveal>
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-600 mb-8">Tuyên ngôn</p>
          <blockquote className="text-4xl md:text-5xl font-serif font-medium italic leading-[1.3] text-primary">
            "Chúng tôi không bán hàng. Chúng tôi xây dựng một cách sống—
            <span className="text-emerald-600"> bền vững, đẹp đẽ</span>, và có ý nghĩa."
          </blockquote>
          <p className="mt-8 text-sm text-primary/50 tracking-[0.2em] uppercase font-bold">— Minh Châu, Co-Founder</p>
        </Reveal>
      </section>

      {/* ── OUR STORY (Simple Carousel) ── */}
      <StoryCarousel />

      {/* ── CORE VALUES ── */}
      <section className="py-32" style={{ background: "#FDFCFB" }}>
        <div className="max-w-7xl mx-auto px-8">
          <Reveal className="mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-600 mb-4">Giá trị cốt lõi</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Chúng tôi <span className="font-serif font-medium italic text-emerald-600">tin vào</span>
            </h2>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-gray-100">
            {VALUES.map((v, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                  className="border-r border-b border-gray-100 p-10 cursor-default transition-colors"
                >
                  <span className="text-[72px] font-serif font-thin text-primary/10 leading-none block mb-4">{v.n}</span>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{v.title}</h3>
                  <p className="text-sm text-primary/55 leading-relaxed font-medium">{v.desc}</p>
                </motion.div>
              </Reveal>
            ))}
            {/* Decorative empty cell */}
            <div className="hidden lg:block border-r border-b border-gray-100 p-10 bg-emerald-50/50 flex items-center justify-center">
              <Leaf className="w-12 h-12 text-emerald-200" />
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT ── */}
      <section className="py-32" style={{ background: "#0D2818" }}>
        <div className="max-w-7xl mx-auto px-8">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-400 mb-6">Tác động thực</p>
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-20">
              Con số <span className="font-serif font-medium italic text-emerald-400">biết nói</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {STATS.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="border-t border-white/10 pt-8">
                  <StatCounter value={s.value} suffix={s.suffix} />
                  <p className="text-sm font-medium text-white/40 uppercase tracking-[0.15em]">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Timeline bar */}
          <Reveal className="mt-24">
            <div className="flex items-center gap-6 flex-wrap">
              {["2021", "2022", "2023", "2024", "2025", "2026 →"].map((y, i) => (
                <div key={i} className="flex items-center gap-6">
                  <span className={`text-sm font-bold ${i === 4 ? "text-emerald-400" : "text-white/30"}`}>{y}</span>
                  {i < 5 && <div className="w-16 h-px bg-white/10" />}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-32" style={{ background: "#FDFCFB" }}>
        <div className="max-w-7xl mx-auto px-8">
          <Reveal className="mb-20">
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-600 mb-4">Con người</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
              Đội ngũ <span className="font-serif font-medium italic text-emerald-600">sáng lập</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {TEAM.map((member, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="group cursor-default">
                  <div className="relative rounded-2xl overflow-hidden mb-5 aspect-[3/4]">
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight">{member.name}</h3>
                  <p className="text-xs font-medium text-primary/40 uppercase tracking-[0.2em] mt-1">{member.role}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-32 mx-8 mb-16 rounded-3xl relative overflow-hidden" style={{ background: "#F5EFE6" }}>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-300 rounded-full blur-[120px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200 rounded-full blur-[80px] -ml-16 -mb-16" />
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-emerald-700 mb-6">Bắt đầu hành trình</p>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-[#111827]">
              Sẵn sàng sống <span className="font-serif font-medium italic text-emerald-700">bền vững?</span>
            </h2>
            <p className="text-primary/60 font-medium text-lg italic mb-12 leading-relaxed">
              Khám phá hơn 200 sản phẩm được tuyển chọn kỹ lưỡng, mỗi sản phẩm đều kể một câu chuyện đẹp đẽ.
            </p>
            <MagneticButton href="/shop">
              Mua sắm ngay <ArrowRight className="w-5 h-5" />
            </MagneticButton>
          </Reveal>
        </div>
      </section>

      <Footer />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&display=swap');
        .font-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>
    </main>
  );
}
