const navLinks = Array.from(document.querySelectorAll(".site-nav__link"));
const sectionIds = navLinks
  .map((link) => link.getAttribute("href"))
  .filter((href) => href && href.startsWith("#"))
  .map((href) => href.slice(1));
const sections = sectionIds
  .map((id) => document.querySelector(`[data-nav-section="${id}"]`) || document.getElementById(id))
  .filter(Boolean);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const interactiveSelector = "a, button, input, textarea, select, label, [data-static-action]";
const languageButtons = Array.from(document.querySelectorAll("[data-lang-option]"));
const storedLanguage = window.localStorage ? localStorage.getItem("portfolioLanguage") : null;
let currentLanguage = ["ko", "en", "ja"].includes(storedLanguage) ? storedLanguage : "ko";
let pendingNavTarget = null;
let pendingNavTimer = 0;

const translations = {
  ko: {
    htmlLang: "ko",
    searchEmpty: "검색 결과가 없습니다.",
    formStatus: {
      sending: "전송 중입니다.",
      success: "메일이 전송되었습니다.",
      error: "메일 전송에 실패했습니다. 잠시 후 다시 전송해주세요.",
    },
    attrs: {
      ".site-nav__search": { "aria-label": "검색" },
      ".site-search__close": { "aria-label": "검색 닫기" },
      "#site-search-input": { placeholder: "섹션 또는 프로젝트 검색" },
      ".hero-portrait": { "aria-label": "프로필 사진" },
      ".hero-portrait img": { alt: "이수지 프로필 사진" },
    },
    selectors: {
      ".skip-link": "본문으로 이동",
      ".site-nav__quick-link": "프로젝트 보기  >",
      ".site-nav__link[href='#home']": "Home",
      ".site-nav__link[href='#about']": "About",
      ".site-nav__link[href='#skills']": "Skills",
      ".site-nav__link[href='#projects']": "Projects",
      ".site-nav__link[href='#gallery']": "Gallery",
      ".site-nav__link[href='#contact']": "Contact",
      ".button--nav": "Contact me",
      ".site-sub-nav span:nth-child(1)": "Korea, KR",
      ".site-sub-nav span:nth-child(3)": "Open to Work · Design, Motion & Web",
      ".site-sub-nav__links": "GitHub　Resume　Email",
      "#site-search-title": "검색",
      ".site-search__close": "닫기",
      ".site-search__label": "검색어",
      ".hero-section__badge": "WEB PUBLISHER · DESIGN · MOTION",
      "#hero-title": "첫 파장 / NEXT WAVE",
      ".hero-section__description": "새로운 흐름을 읽고, 더 나은 경험을 설계하다.",
      ".hero-section__actions .button--dark span": '<span class="font-poppins">GitHub</span> 보기',
      ".hero-section__actions .button--light span": "이력서 보기",
      ".section-heading__eyebrow": "PORTFOLIO PROFILE",
      "#about-title": "About Me",
      ".about-section .section-heading__description": '<span class="font-poppins">UX</span>/<span class="font-poppins">UI</span> 디자인과 영상 제작을 거쳐, 지금은 그 감각을 코드로 옮기는 웹퍼블리셔 이수지입니다.',
      ".about-section .profile-card:nth-of-type(1) .profile-card__title": "인적사항",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(1)": "<strong>이름</strong> : 이수지",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(2)": '<strong>나이</strong> : <span class="font-poppins">1987.08.13</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(3)": "<strong>연락처</strong>",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(4)": '<strong>휴대폰</strong> : <span class="font-poppins">010.3531.7769</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(5)": '<strong>이메일</strong> : <span class="font-poppins">unnyappy87@gmail.com</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(6)": "<strong>거주지</strong> : 서울시 중랑구",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(7)": "<strong>희망직무</strong> : 웹디자인, 웹퍼블리셔",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(8)": '<strong>포트폴리오</strong> : <a class="profile-card__link" href="https://github.com/unnyappy87/pro" target="_blank" rel="noopener noreferrer">https://github.com/unnyappy87/pro</a>',
      ".about-section .profile-card:nth-of-type(2) .profile-card__title": "학력 및 교육사항",
      ".about-section .profile-card:nth-of-type(2) .profile-card__body": '<p><strong>학교명</strong> : 극동대학교</p><p><strong>전공</strong> : 만화애니메이션과</p><p><strong>재학 기간</strong> : <span class="font-poppins">2</span>년</p><p><strong>졸업/재학/수료 상태</strong> : 중퇴</p><br><p><strong>교육사항 <span class="font-poppins">1</span></strong></p><p><strong>교육기관명</strong> : 그린컴퓨터아트학원</p><p><strong>과정명 : (<span class="font-poppins">NCS</span>)</strong> 경리실무(전산세무, 전산회계, 경리실무) 취업과정</p><p><strong>교육 기간</strong> : <span class="font-poppins">2016. 12 ~ 2017. 02</span></p><p><strong>내용</strong> : 케어링 및 더존실무 / 전산회계 <span class="font-poppins">1</span>급, 전산세무 <span class="font-poppins">2</span>급 자격취득과정</p><br><p><strong>교육사항 <span class="font-poppins">2</span></strong></p><p><strong>교육기관명</strong> : 하이미디어인재개발원</p><p><strong>과정명</strong> : <span class="font-poppins">UI</span>/<span class="font-poppins">UX</span> 반응형 웹디자인 &amp; 웹퍼블리싱 <span class="font-poppins">B</span></p><p><strong>교육 기간</strong> : <span class="font-poppins">2020. 06 ~ 2021. 01</span></p><p><strong>내용</strong> : 포토샵, 일러스트, 코딩</p><br><p><strong>교육사항 <span class="font-poppins">3</span></strong></p><p><strong>교육기관명</strong> : 서울시남부기술교육원</p><p><strong>과정명</strong> : 디지털콘텐츠디자인</p><p><strong>교육 기간</strong> : <span class="font-poppins">2023. 02 ~ 2023. 08</span></p><p><strong>내용</strong> : 디지털콘텐츠디자인(포토샵, 일러스트, 인디자인)</p>',
      ".about-section .profile-card:nth-of-type(3) .profile-card__title": "자격사항",
      ".about-section .profile-card:nth-of-type(3) .profile-card__body": '<p><strong>취득날짜</strong> : <span class="font-poppins">2016.07</span><br><strong>자격명</strong> : <span class="font-poppins">DIAT</span>-스프레드시트<br><strong>주최처</strong> : 한국정보통신진흥협회</p><p><strong>취득날짜</strong> : <span class="font-poppins">2017.03</span><br><strong>자격명</strong> : 전산회계 <span class="font-poppins">1</span>급<br><strong>주최처</strong> : 한국세무사회</p><p><strong>취득날짜</strong> : <span class="font-poppins">2018.01</span><br><strong>자격명</strong> : <span class="font-poppins">JLPT N2</span><br><strong>주최처</strong> : 공익재단법인 일본국제교육지원협회</p><p><strong>취득날짜</strong> : <span class="font-poppins">2023.07</span><br><strong>자격명</strong> : <span class="font-poppins">GTQ</span> 포토샵 <span class="font-poppins">1</span>급<br><strong>주최처</strong> : 한국생산성본부</p>',
      "#projects-title": "TEAM PROJECTS",
      ".projects-section__heading .section-heading__description": "팀원들과 기획부터 제작까지 함께하며<br>협업 과정 속에서 완성한 프로젝트입니다.",
      ".projects-section .project-panel:nth-of-type(1) h3": "풀무원 웹사이트 리디자인",
      ".projects-section .project-panel:nth-of-type(1) .project-button--light": "기획서 보기",
      ".projects-section .project-panel:nth-of-type(1) .project-button--dark": "사이트 보기",
      ".projects-section .project-panel:nth-of-type(1) .project-panel__specs": '<li><span>구현 기술</span><strong>HTML · CSS · JavaScript · Figma</strong></li><li><span>작업 기간</span><strong>2026.07 ~ 2026.08</strong></li><li><span>배포 매체</span><strong>웹(PC · 모바일)</strong></li><li><span>본인 기여도</span><strong>13.5%</strong></li><li><span>프로그램 호환성</span><strong>Chrome</strong></li><li><span>페이지 수</span><strong>1페이지</strong></li><li class="project-panel__feature"><span>특징</span><strong>친환경 브랜드 가치 전달 중심 UI 개선, 웹 접근성 향상, 반응형 레이아웃 적용</strong></li>',
      ".projects-section .project-panel:nth-of-type(2) h3": "풀무원 UI/UX 리디자인",
      ".projects-section .project-panel:nth-of-type(2) .project-button--dark": "구현화면 보기",
      ".projects-section .project-panel:nth-of-type(2) .project-panel__specs": '<li><span>구현 기술</span><strong>Figma</strong></li><li><span>작업 기간</span><strong>1주</strong></li><li><span>배포 매체</span><strong>웹(PC · 모바일)</strong></li><li><span>본인 기여도</span><strong>13.5%</strong></li><li><span>프로그램 호환성</span><strong>Chrome</strong></li><li><span>페이지 수</span><strong>1페이지</strong></li><li class="project-panel__feature"><span>특징</span><strong>사용자 경험 중심 UI/UX 개선, 인터렉션 디자인, 프로토타입 제작</strong></li>',
      "#skills-title": "Skills",
      ".skills-section__description": "디자인, 웹 퍼블리싱, 영상 제작에 필요한 다양한 툴과 기술을 활용할 수 있습니다.",
      ".skill-card:nth-child(1) p": "화면의 구조와 시각적인 요소를 설계합니다.",
      ".skill-card:nth-child(2) p": "디자인을 반응형 웹 화면으로 구현합니다.",
      ".skill-card:nth-child(3) p": "화면의 흐름과 리듬을 고려해 영상을 편집합니다.",
      "#pictures-title": "Pictures",
      ".pictures-section > p": "그림으로 남긴 시간 · Hand-drawn moments",
      "#gallery-title": "LIFE LOG",
      ".gallery-section > p": "여행부터 취미까지, 일상 속 다양한 시간을 기록합니다.",
      "#contact-title": "Contact",
      ".contact-panel__title": "LET’S WORK TOGETHER",
      ".contact-panel__description": "새로운 프로젝트와 기회를 기다리고 있습니다.",
      ".contact-form label[for='name']": "이름",
      ".contact-form label[for='email']": "이메일 주소",
      ".contact-form label[for='subject']": "제목",
      ".contact-form label[for='message']": "내용",
      ".contact-form__submit": "전송하기",
      ".site-footer__copyright": "Copyright",
    },
    searchItems: [
      { title: "Home", meta: "첫 화면", targetId: "home", keywords: "home intro portfolio main" },
      { title: "About Me", meta: "인적사항과 교육사항", targetId: "about", keywords: "about profile education personal" },
      { title: "Skills", meta: "디자인, 퍼블리싱, 모션 역량", targetId: "skills", keywords: "skills design web publishing motion figma html css javascript" },
      { title: "Team Projects", meta: "팀 프로젝트 섹션", targetId: "projects", keywords: "projects team pulmuone redesign ui ux website" },
      { title: "풀무원 웹사이트 리디자인", meta: "팀 프로젝트 01", targetId: "projects", keywords: "pulmuone website redesign site team" },
      { title: "풀무원 UI/UX 리디자인", meta: "팀 프로젝트 02", targetId: "projects", keywords: "pulmuone ui ux redesign figma team" },
      { title: "Gallery", meta: "작업 이미지 모음", targetId: "gallery", keywords: "gallery images pictures portfolio" },
      { title: "Contact", meta: "연락처와 문의 폼", targetId: "contact", keywords: "contact email phone message" },
    ],
  },
  en: {
    htmlLang: "en",
    searchEmpty: "No results found.",
    formStatus: {
      sending: "Sending...",
      success: "Your message has been sent.",
      error: "Failed to send the message. Please try again later.",
    },
    attrs: {
      ".site-nav__search": { "aria-label": "Search" },
      ".site-search__close": { "aria-label": "Close search" },
      "#site-search-input": { placeholder: "Search sections or projects" },
      ".hero-portrait": { "aria-label": "Profile photo" },
      ".hero-portrait img": { alt: "Lee Suji profile photo" },
    },
    selectors: {
      ".skip-link": "Skip to content",
      ".site-nav__quick-link": "View projects  >",
      ".site-nav__link[href='#home']": "Home",
      ".site-nav__link[href='#about']": "About",
      ".site-nav__link[href='#skills']": "Skills",
      ".site-nav__link[href='#projects']": "Projects",
      ".site-nav__link[href='#gallery']": "Gallery",
      ".site-nav__link[href='#contact']": "Contact",
      ".button--nav": "Contact me",
      ".site-sub-nav span:nth-child(1)": "Korea, KR",
      ".site-sub-nav span:nth-child(3)": "Open to Work · Design, Motion & Web",
      ".site-sub-nav__links": "GitHub　Resume　Email",
      "#site-search-title": "Search",
      ".site-search__close": "Close",
      ".site-search__label": "Keyword",
      ".hero-section__badge": "WEB PUBLISHER · DESIGN · MOTION",
      "#hero-title": "FIRST WAVE / NEXT WAVE",
      ".hero-section__description": "Reading new flows and designing better experiences.",
      ".hero-section__actions .button--dark span": '<span class="font-poppins">GitHub</span>',
      ".hero-section__actions .button--light span": "View Resume",
      ".section-heading__eyebrow": "PORTFOLIO PROFILE",
      "#about-title": "About Me",
      ".about-section .section-heading__description": 'I am Lee Suji, a web publisher who brings <span class="font-poppins">UX</span>/<span class="font-poppins">UI</span> design and video production experience into code.',
      ".about-section .profile-card:nth-of-type(1) .profile-card__title": "Personal Information",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(1)": "<strong>Name</strong> : Lee Suji",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(2)": '<strong>Date of Birth</strong> : <span class="font-poppins">1987.08.13</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(3)": "<strong>Contact</strong>",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(4)": '<strong>Mobile</strong> : <span class="font-poppins">010.3531.7769</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(5)": '<strong>Email</strong> : <span class="font-poppins">unnyappy87@gmail.com</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(6)": "<strong>Location</strong> : Jungnang-gu, Seoul",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(7)": "<strong>Desired Role</strong> : Web Designer, Web Publisher",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(8)": '<strong>Portfolio</strong> : <a class="profile-card__link" href="https://github.com/unnyappy87/pro" target="_blank" rel="noopener noreferrer">https://github.com/unnyappy87/pro</a>',
      ".about-section .profile-card:nth-of-type(2) .profile-card__title": "Education & Training",
      ".about-section .profile-card:nth-of-type(2) .profile-card__body": '<p><strong>School</strong> : Far East University</p><p><strong>Major</strong> : Cartoon &amp; Animation</p><p><strong>Period</strong> : <span class="font-poppins">2</span> years</p><p><strong>Status</strong> : Withdrawn</p><br><p><strong>Training <span class="font-poppins">1</span></strong></p><p><strong>Institution</strong> : Green Computer Art Academy</p><p><strong>Course</strong> : <span class="font-poppins">NCS</span> Accounting Practice Employment Course</p><p><strong>Period</strong> : <span class="font-poppins">2016. 12 ~ 2017. 02</span></p><p><strong>Content</strong> : Accounting practice, computerized accounting level 1, computerized tax accounting level 2 certification course</p><br><p><strong>Training <span class="font-poppins">2</span></strong></p><p><strong>Institution</strong> : HiMedia Human Resource Development Institute</p><p><strong>Course</strong> : Responsive Web Design &amp; Web Publishing <span class="font-poppins">B</span> for <span class="font-poppins">UI</span>/<span class="font-poppins">UX</span></p><p><strong>Period</strong> : <span class="font-poppins">2020. 06 ~ 2021. 01</span></p><p><strong>Content</strong> : Photoshop, Illustrator, coding</p><br><p><strong>Training <span class="font-poppins">3</span></strong></p><p><strong>Institution</strong> : Seoul Nambu Technical Education Center</p><p><strong>Course</strong> : Digital Contents Design</p><p><strong>Period</strong> : <span class="font-poppins">2023. 02 ~ 2023. 08</span></p><p><strong>Content</strong> : Digital contents design including Photoshop, Illustrator, and InDesign</p>',
      ".about-section .profile-card:nth-of-type(3) .profile-card__title": "Certifications",
      ".about-section .profile-card:nth-of-type(3) .profile-card__body": '<p><strong>Date</strong> : <span class="font-poppins">2016.07</span><br><strong>Certification</strong> : <span class="font-poppins">DIAT</span> Spreadsheet<br><strong>Issuer</strong> : Korea Association for ICT Promotion</p><p><strong>Date</strong> : <span class="font-poppins">2017.03</span><br><strong>Certification</strong> : Computerized Accounting Level <span class="font-poppins">1</span><br><strong>Issuer</strong> : Korean Association of Certified Public Tax Accountants</p><p><strong>Date</strong> : <span class="font-poppins">2018.01</span><br><strong>Certification</strong> : <span class="font-poppins">JLPT N2</span><br><strong>Issuer</strong> : Japan Educational Exchanges and Services</p><p><strong>Date</strong> : <span class="font-poppins">2023.07</span><br><strong>Certification</strong> : <span class="font-poppins">GTQ</span> Photoshop Level <span class="font-poppins">1</span><br><strong>Issuer</strong> : Korea Productivity Center</p>',
      "#projects-title": "TEAM PROJECTS",
      ".projects-section__heading .section-heading__description": "Projects completed through teamwork,<br>from planning to production.",
      ".projects-section .project-panel:nth-of-type(1) h3": "Pulmuone Website Redesign",
      ".projects-section .project-panel:nth-of-type(1) .project-button--light": "View Proposal",
      ".projects-section .project-panel:nth-of-type(1) .project-button--dark": "View Site",
      ".projects-section .project-panel:nth-of-type(1) .project-panel__specs": '<li><span>Tech Stack</span><strong>HTML · CSS · JavaScript · Figma</strong></li><li><span>Period</span><strong>2026.07 ~ 2026.08</strong></li><li><span>Platform</span><strong>Web (PC · Mobile)</strong></li><li><span>Contribution</span><strong>13.5%</strong></li><li><span>Compatibility</span><strong>Chrome</strong></li><li><span>Pages</span><strong>1 page</strong></li><li class="project-panel__feature"><span>Features</span><strong>Improved UI focused on eco-friendly brand value, accessibility, and responsive layout</strong></li>',
      ".projects-section .project-panel:nth-of-type(2) h3": "Pulmuone UI/UX Redesign",
      ".projects-section .project-panel:nth-of-type(2) .project-button--dark": "View Prototype",
      ".projects-section .project-panel:nth-of-type(2) .project-panel__specs": '<li><span>Tool</span><strong>Figma</strong></li><li><span>Period</span><strong>1 week</strong></li><li><span>Platform</span><strong>Web (PC · Mobile)</strong></li><li><span>Contribution</span><strong>13.5%</strong></li><li><span>Compatibility</span><strong>Chrome</strong></li><li><span>Pages</span><strong>1 page</strong></li><li class="project-panel__feature"><span>Features</span><strong>User-centered UI/UX improvement, interaction design, and prototyping</strong></li>',
      "#skills-title": "Skills",
      ".skills-section__description": "I can use a range of tools and skills for design, web publishing, and video production.",
      ".skill-card:nth-child(1) p": "I design screen structures and visual elements.",
      ".skill-card:nth-child(2) p": "I turn designs into responsive web interfaces.",
      ".skill-card:nth-child(3) p": "I edit videos with attention to flow and rhythm.",
      "#pictures-title": "Pictures",
      ".pictures-section > p": "Hand-drawn moments from different times.",
      "#gallery-title": "LIFE LOG",
      ".gallery-section > p": "A record of everyday moments, from travel to hobbies.",
      "#contact-title": "Contact",
      ".contact-panel__title": "LET’S WORK TOGETHER",
      ".contact-panel__description": "I am open to new projects and opportunities.",
      ".contact-form label[for='name']": "Name",
      ".contact-form label[for='email']": "Email Address",
      ".contact-form label[for='subject']": "Subject",
      ".contact-form label[for='message']": "Message",
      ".contact-form__submit": "Send",
      ".site-footer__copyright": "Copyright",
    },
    searchItems: [
      { title: "Home", meta: "Intro section", targetId: "home", keywords: "home intro portfolio main" },
      { title: "About Me", meta: "Profile and education", targetId: "about", keywords: "about profile education personal" },
      { title: "Skills", meta: "Design, publishing, and motion skills", targetId: "skills", keywords: "skills design web publishing motion figma html css javascript" },
      { title: "Team Projects", meta: "Team project section", targetId: "projects", keywords: "projects team pulmuone redesign ui ux website" },
      { title: "Pulmuone Website Redesign", meta: "Team Project 01", targetId: "projects", keywords: "pulmuone website redesign site team" },
      { title: "Pulmuone UI/UX Redesign", meta: "Team Project 02", targetId: "projects", keywords: "pulmuone ui ux redesign figma team" },
      { title: "Gallery", meta: "Visual archive", targetId: "gallery", keywords: "gallery images pictures portfolio" },
      { title: "Contact", meta: "Contact information and form", targetId: "contact", keywords: "contact email phone message" },
    ],
  },
  ja: {
    htmlLang: "ja",
    searchEmpty: "検索結果がありません。",
    formStatus: {
      sending: "送信中です。",
      success: "メールが送信されました。",
      error: "メール送信に失敗しました。しばらくしてからもう一度お試しください。",
    },
    attrs: {
      ".site-nav__search": { "aria-label": "検索" },
      ".site-search__close": { "aria-label": "検索を閉じる" },
      "#site-search-input": { placeholder: "セクションまたはプロジェクトを検索" },
      ".hero-portrait": { "aria-label": "プロフィール写真" },
      ".hero-portrait img": { alt: "イ・スジのプロフィール写真" },
    },
    selectors: {
      ".skip-link": "本文へ移動",
      ".site-nav__quick-link": "プロジェクトを見る  >",
      ".site-nav__link[href='#home']": "Home",
      ".site-nav__link[href='#about']": "About",
      ".site-nav__link[href='#skills']": "Skills",
      ".site-nav__link[href='#projects']": "Projects",
      ".site-nav__link[href='#gallery']": "Gallery",
      ".site-nav__link[href='#contact']": "Contact",
      ".button--nav": "Contact me",
      ".site-sub-nav span:nth-child(1)": "Korea, KR",
      ".site-sub-nav span:nth-child(3)": "Open to Work · Design, Motion & Web",
      ".site-sub-nav__links": "GitHub　Resume　Email",
      "#site-search-title": "検索",
      ".site-search__close": "閉じる",
      ".site-search__label": "キーワード",
      ".hero-section__badge": "WEB PUBLISHER · DESIGN · MOTION",
      "#hero-title": "最初の波 / NEXT WAVE",
      ".hero-section__description": "新しい流れを読み取り、より良い体験を設計します。",
      ".hero-section__actions .button--dark span": '<span class="font-poppins">GitHub</span>を見る',
      ".hero-section__actions .button--light span": "履歴書を見る",
      ".section-heading__eyebrow": "PORTFOLIO PROFILE",
      "#about-title": "About Me",
      ".about-section .section-heading__description": '<span class="font-poppins">UX</span>/<span class="font-poppins">UI</span>デザインと映像制作の経験を活かし、その感覚をコードで表現するWebパブリッシャー、イ・スジです。',
      ".about-section .profile-card:nth-of-type(1) .profile-card__title": "個人情報",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(1)": "<strong>名前</strong> : イ・スジ",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(2)": '<strong>生年月日</strong> : <span class="font-poppins">1987.08.13</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(3)": "<strong>連絡先</strong>",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(4)": '<strong>携帯電話</strong> : <span class="font-poppins">010.3531.7769</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(5)": '<strong>メール</strong> : <span class="font-poppins">unnyappy87@gmail.com</span>',
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(6)": "<strong>居住地</strong> : ソウル市中浪区",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(7)": "<strong>希望職種</strong> : Webデザイナー、Webパブリッシャー",
      ".about-section .profile-card:nth-of-type(1) .profile-card__body p:nth-child(8)": '<strong>ポートフォリオ</strong> : <a class="profile-card__link" href="https://github.com/unnyappy87/pro" target="_blank" rel="noopener noreferrer">https://github.com/unnyappy87/pro</a>',
      ".about-section .profile-card:nth-of-type(2) .profile-card__title": "学歴・教育",
      ".about-section .profile-card:nth-of-type(2) .profile-card__body": '<p><strong>学校名</strong> : 極東大学</p><p><strong>専攻</strong> : 漫画アニメーション学科</p><p><strong>在学期間</strong> : <span class="font-poppins">2</span>年</p><p><strong>状態</strong> : 中退</p><br><p><strong>教育 <span class="font-poppins">1</span></strong></p><p><strong>教育機関</strong> : グリーンコンピューターアート学院</p><p><strong>課程名</strong> : <span class="font-poppins">NCS</span> 経理実務就職課程</p><p><strong>期間</strong> : <span class="font-poppins">2016. 12 ~ 2017. 02</span></p><p><strong>内容</strong> : 会計実務、電算会計1級、電算税務2級資格取得課程</p><br><p><strong>教育 <span class="font-poppins">2</span></strong></p><p><strong>教育機関</strong> : ハイメディア人材開発院</p><p><strong>課程名</strong> : <span class="font-poppins">UI</span>/<span class="font-poppins">UX</span> レスポンシブWebデザイン &amp; Webパブリッシング <span class="font-poppins">B</span></p><p><strong>期間</strong> : <span class="font-poppins">2020. 06 ~ 2021. 01</span></p><p><strong>内容</strong> : Photoshop、Illustrator、コーディング</p><br><p><strong>教育 <span class="font-poppins">3</span></strong></p><p><strong>教育機関</strong> : ソウル南部技術教育院</p><p><strong>課程名</strong> : デジタルコンテンツデザイン</p><p><strong>期間</strong> : <span class="font-poppins">2023. 02 ~ 2023. 08</span></p><p><strong>内容</strong> : デジタルコンテンツデザイン（Photoshop、Illustrator、InDesign）</p>',
      ".about-section .profile-card:nth-of-type(3) .profile-card__title": "資格",
      ".about-section .profile-card:nth-of-type(3) .profile-card__body": '<p><strong>取得日</strong> : <span class="font-poppins">2016.07</span><br><strong>資格名</strong> : <span class="font-poppins">DIAT</span> スプレッドシート<br><strong>発行機関</strong> : 韓国情報通信振興協会</p><p><strong>取得日</strong> : <span class="font-poppins">2017.03</span><br><strong>資格名</strong> : 電算会計 <span class="font-poppins">1</span>級<br><strong>発行機関</strong> : 韓国税務士会</p><p><strong>取得日</strong> : <span class="font-poppins">2018.01</span><br><strong>資格名</strong> : <span class="font-poppins">JLPT N2</span><br><strong>発行機関</strong> : 日本国際教育支援協会</p><p><strong>取得日</strong> : <span class="font-poppins">2023.07</span><br><strong>資格名</strong> : <span class="font-poppins">GTQ</span> Photoshop <span class="font-poppins">1</span>級<br><strong>発行機関</strong> : 韓国生産性本部</p>',
      "#projects-title": "TEAM PROJECTS",
      ".projects-section__heading .section-heading__description": "企画から制作までチームで進め、<br>協業の中で完成させたプロジェクトです。",
      ".projects-section .project-panel:nth-of-type(1) h3": "プルムウォン Webサイトリデザイン",
      ".projects-section .project-panel:nth-of-type(1) .project-button--light": "企画書を見る",
      ".projects-section .project-panel:nth-of-type(1) .project-button--dark": "サイトを見る",
      ".projects-section .project-panel:nth-of-type(1) .project-panel__specs": '<li><span>使用技術</span><strong>HTML · CSS · JavaScript · Figma</strong></li><li><span>制作期間</span><strong>2026.07 ~ 2026.08</strong></li><li><span>対応媒体</span><strong>Web（PC · Mobile）</strong></li><li><span>担当比率</span><strong>13.5%</strong></li><li><span>互換ブラウザ</span><strong>Chrome</strong></li><li><span>ページ数</span><strong>1ページ</strong></li><li class="project-panel__feature"><span>特徴</span><strong>環境にやさしいブランド価値を伝えるUI改善、アクセシビリティ向上、レスポンシブレイアウト適用</strong></li>',
      ".projects-section .project-panel:nth-of-type(2) h3": "プルムウォン UI/UXリデザイン",
      ".projects-section .project-panel:nth-of-type(2) .project-button--dark": "実装画面を見る",
      ".projects-section .project-panel:nth-of-type(2) .project-panel__specs": '<li><span>使用ツール</span><strong>Figma</strong></li><li><span>制作期間</span><strong>1週間</strong></li><li><span>対応媒体</span><strong>Web（PC · Mobile）</strong></li><li><span>担当比率</span><strong>13.5%</strong></li><li><span>互換ブラウザ</span><strong>Chrome</strong></li><li><span>ページ数</span><strong>1ページ</strong></li><li class="project-panel__feature"><span>特徴</span><strong>ユーザー体験中心のUI/UX改善、インタラクションデザイン、プロトタイプ制作</strong></li>',
      "#skills-title": "Skills",
      ".skills-section__description": "デザイン、Webパブリッシング、映像制作に必要なさまざまなツールとスキルを活用できます。",
      ".skill-card:nth-child(1) p": "画面構成と視覚要素を設計します。",
      ".skill-card:nth-child(2) p": "デザインをレスポンシブWeb画面として実装します。",
      ".skill-card:nth-child(3) p": "画面の流れとリズムを考慮して映像を編集します。",
      "#pictures-title": "Pictures",
      ".pictures-section > p": "絵で残した時間 · Hand-drawn moments",
      "#gallery-title": "LIFE LOG",
      ".gallery-section > p": "旅行から趣味まで、日常のさまざまな時間を記録しています。",
      "#contact-title": "Contact",
      ".contact-panel__title": "LET’S WORK TOGETHER",
      ".contact-panel__description": "新しいプロジェクトや機会をお待ちしています。",
      ".contact-form label[for='name']": "名前",
      ".contact-form label[for='email']": "メールアドレス",
      ".contact-form label[for='subject']": "件名",
      ".contact-form label[for='message']": "内容",
      ".contact-form__submit": "送信する",
      ".site-footer__copyright": "Copyright",
    },
    searchItems: [
      { title: "Home", meta: "ファーストビュー", targetId: "home", keywords: "home intro portfolio main" },
      { title: "About Me", meta: "個人情報と教育", targetId: "about", keywords: "about profile education personal" },
      { title: "Skills", meta: "デザイン、パブリッシング、モーションスキル", targetId: "skills", keywords: "skills design web publishing motion figma html css javascript" },
      { title: "Team Projects", meta: "チームプロジェクトセクション", targetId: "projects", keywords: "projects team pulmuone redesign ui ux website" },
      { title: "プルムウォン Webサイトリデザイン", meta: "チームプロジェクト 01", targetId: "projects", keywords: "pulmuone website redesign site team" },
      { title: "プルムウォン UI/UXリデザイン", meta: "チームプロジェクト 02", targetId: "projects", keywords: "pulmuone ui ux redesign figma team" },
      { title: "Gallery", meta: "作業イメージ集", targetId: "gallery", keywords: "gallery images pictures portfolio" },
      { title: "Contact", meta: "連絡先とお問い合わせフォーム", targetId: "contact", keywords: "contact email phone message" },
    ],
  },
};

function setContent(selector, content) {
  document.querySelectorAll(selector).forEach((element) => {
    element.innerHTML = content;
  });
}

function setAttributes(selector, attributes) {
  document.querySelectorAll(selector).forEach((element) => {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  });
}

function applyLanguage(language) {
  const dictionary = translations[language] || translations.ko;

  currentLanguage = language;
  document.documentElement.lang = dictionary.htmlLang;

  Object.entries(dictionary.selectors).forEach(([selector, content]) => {
    setContent(selector, content);
  });

  Object.entries(dictionary.attrs).forEach(([selector, attributes]) => {
    setAttributes(selector, attributes);
  });

  languageButtons.forEach((button) => {
    const isActive = button.dataset.langOption === language;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  if (window.localStorage) {
    localStorage.setItem("portfolioLanguage", language);
  }

  if (searchDialog && searchDialog.classList.contains("is-open")) {
    renderSearchResults(searchInput.value);
  }
}

function getNavTarget(targetId) {
  return document.querySelector(`[data-nav-section="${targetId}"]`) || document.getElementById(targetId);
}

function settleNavScroll(target, targetId, attempt = 0) {
  const delta = target.getBoundingClientRect().top;

  if (Math.abs(delta) > 4) {
    window.scrollTo({
      top: window.scrollY + delta,
      behavior: "auto",
    });
  }

  if (attempt < 18) {
    window.setTimeout(() => settleNavScroll(target, targetId, attempt + 1), 90);
    return;
  }

  setActiveNavLink(targetId);
  window.clearTimeout(pendingNavTimer);
  pendingNavTimer = window.setTimeout(() => {
    if (pendingNavTarget === targetId) {
      pendingNavTarget = null;
    }
  }, 500);
}

function setActiveNavLink(activeId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${activeId}`;

    link.classList.toggle("site-nav__link--active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function scrollToTarget(targetId) {
  const target = getNavTarget(targetId);

  if (!target) {
    return;
  }

  if (window.ScrollTrigger && typeof ScrollTrigger.refresh === "function") {
    ScrollTrigger.refresh();
  }

  pendingNavTarget = targetId;
  setActiveNavLink(targetId);

  window.scrollTo({
    top: target.getBoundingClientRect().top + window.scrollY,
    behavior: "auto",
  });

  window.clearTimeout(pendingNavTimer);
  pendingNavTimer = window.setTimeout(() => settleNavScroll(target, targetId), 90);
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href").slice(1);

    if (!getNavTarget(targetId)) {
      return;
    }

    event.preventDefault();
    scrollToTarget(targetId);
    history.pushState(null, "", `#${targetId}`);
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    if (pendingNavTarget) {
      setActiveNavLink(pendingNavTarget);
      return;
    }

    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) {
      setActiveNavLink(visibleEntry.target.id);
    }
  },
  {
    root: null,
    rootMargin: "-20% 0px -55% 0px",
    threshold: [0.1, 0.25, 0.5],
  }
);

sections.forEach((section) => observer.observe(section));

const searchButton = document.querySelector(".site-nav__search");
const searchDialog = document.getElementById("site-search");
const searchInput = document.getElementById("site-search-input");
const searchResults = searchDialog ? searchDialog.querySelector("[data-search-results]") : null;
const searchCloseButton = searchDialog ? searchDialog.querySelector(".site-search__close") : null;

function renderSearchResults(query = "") {
  if (!searchResults) {
    return;
  }

  const searchItems = translations[currentLanguage].searchItems;
  const normalizedQuery = query.trim().toLowerCase();
  const matchedItems = normalizedQuery
    ? searchItems.filter((item) => {
        const haystack = `${item.title} ${item.meta} ${item.keywords}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : searchItems.slice(0, 6);

  searchResults.replaceChildren();

  if (!matchedItems.length) {
    const empty = document.createElement("span");
    empty.className = "site-search__empty";
    empty.textContent = translations[currentLanguage].searchEmpty;
    searchResults.append(empty);
    return;
  }

  matchedItems.forEach((item) => {
    const resultButton = document.createElement("button");
    const title = document.createElement("span");
    const meta = document.createElement("span");

    resultButton.className = "site-search__result";
    resultButton.type = "button";
    title.className = "site-search__result-title";
    meta.className = "site-search__result-meta";
    title.textContent = item.title;
    meta.textContent = item.meta;

    resultButton.append(title, meta);
    resultButton.addEventListener("click", () => {
      closeSearch();
      scrollToTarget(item.targetId);
      history.pushState(null, "", `#${item.targetId}`);
    });

    searchResults.append(resultButton);
  });
}

function openSearch() {
  if (!searchDialog || !searchInput) {
    return;
  }

  searchDialog.classList.add("is-open");
  searchDialog.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-search-open");
  renderSearchResults(searchInput.value);

  window.setTimeout(() => {
    searchInput.focus();
    searchInput.select();
  }, 40);
}

function closeSearch() {
  if (!searchDialog) {
    return;
  }

  searchDialog.classList.remove("is-open");
  searchDialog.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-search-open");
  if (searchButton) {
    searchButton.focus();
  }
}

if (searchButton && searchDialog && searchInput) {
  searchButton.addEventListener("click", () => {
    openSearch();
  });

  searchCloseButton.addEventListener("click", closeSearch);
  searchInput.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchDialog.addEventListener("click", (event) => {
    if (event.target === searchDialog) {
      closeSearch();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchDialog.classList.contains("is-open")) {
      closeSearch();
    }
  });
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.langOption);
  });
});

applyLanguage(currentLanguage);

document.querySelectorAll("[data-static-action]").forEach((control) => {
  control.addEventListener("click", () => {
    control.blur();
  });
});

function initContactForm() {
  const form = document.getElementById("contact-form");
  const status = document.getElementById("status");

  if (!form || !status || !window.emailjs) {
    return;
  }

  emailjs.init({
    publicKey: "b_mwkjFC0p5-rWj1_",
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const submitButton = form.querySelector(".contact-form__submit");

    status.textContent = translations[currentLanguage].formStatus.sending;
    if (submitButton) {
      submitButton.disabled = true;
    }

    emailjs.sendForm("service_dal8y14", "template_5fad5k7", form).then(
      () => {
        status.textContent = translations[currentLanguage].formStatus.success;
        form.reset();
      },
      () => {
        status.textContent = translations[currentLanguage].formStatus.error;
      }
    ).finally(() => {
      if (submitButton) {
        submitButton.disabled = false;
      }
    });
  });
}

if (window.location.hash) {
  const targetId = window.location.hash.slice(1);

  window.requestAnimationFrame(() => {
    scrollToTarget(targetId);
  });
} else {
  setActiveNavLink("home");
}

initContactForm();

function createHorizontalTrack(sectionSelector, itemSelector, viewportClass, trackClass) {
  const section = document.querySelector(sectionSelector);

  if (!section || section.querySelector(`.${viewportClass}`)) {
    return section;
  }

  const items = Array.from(section.querySelectorAll(itemSelector));

  if (items.length < 2) {
    return section;
  }

  const viewport = document.createElement("div");
  const track = document.createElement("div");

  viewport.className = `horizontal-scroll ${viewportClass}`;
  track.className = `horizontal-scroll__track ${trackClass}`;

  items[0].before(viewport);
  viewport.append(track);
  items.forEach((item) => track.append(item));

  return section;
}

function initHorizontalSections() {
  createHorizontalTrack(
    ".projects-section .section-container",
    ".project-panel",
    "projects-section__viewport",
    "projects-section__track"
  );

  const groups = [
    {
      section: document.querySelector(".projects-section"),
      viewport: document.querySelector(".projects-section__viewport"),
      track: document.querySelector(".projects-section__track"),
    },
    {
      section: document.querySelector(".pictures-section"),
      viewport: document.querySelector(".pictures-section__viewport"),
      track: document.querySelector(".pictures-section__grid"),
    },
    {
      section: document.querySelector(".gallery-section"),
      viewport: document.querySelector(".gallery-section__viewport"),
      track: document.querySelector(".gallery-section__grid"),
    },
  ];

  if (prefersReducedMotion.matches) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    groups.forEach(({ viewport }) => {
      if (viewport) {
        viewport.style.overflowX = "auto";
      }
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  let resizeFrame = 0;

  const setupScroll = ({ section, viewport, track }) => {
    if (!section || !viewport || !track) {
      return;
    }

    if (track.horizontalScrollTween && track.horizontalScrollTween.scrollTrigger) {
      track.horizontalScrollTween.scrollTrigger.kill();
      track.horizontalScrollTween.kill();
      track.horizontalScrollTween = null;
    }

    const moveDistance = Math.max(0, track.scrollWidth - viewport.clientWidth);

    if (moveDistance <= 0 || window.matchMedia("(max-width: 720px)").matches) {
      gsap.set(track, { clearProps: "transform" });
      viewport.style.overflowX = "auto";
      return;
    }

    viewport.style.overflowX = "hidden";

    track.horizontalScrollTween = gsap.to(track, {
      x: -moveDistance,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top 8%",
        end: () => `+=${moveDistance + viewport.clientWidth * 0.25}`,
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  };

  const refreshScroll = () => {
    groups.forEach(setupScroll);
    ScrollTrigger.refresh();
  };

  window.addEventListener("load", () => {
    refreshScroll();
    window.setTimeout(refreshScroll, 350);
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(refreshScroll);
  });

  document.querySelectorAll("img").forEach((image) => {
    if (image.complete) {
      return;
    }

    image.addEventListener("load", refreshScroll, { once: true });
  });
}

function initFlipModal() {
  if (!window.gsap || !window.Flip) {
    return;
  }

  gsap.registerPlugin(Flip);

  const modal = document.createElement("div");
  const modalContent = document.createElement("div");
  let activeCard = null;
  let activePlaceholder = null;
  let activeParent = null;
  let activeNextSibling = null;
  let activeViewport = null;
  let isAnimating = false;

  modal.className = "flip-modal";
  modal.setAttribute("aria-hidden", "true");
  modalContent.className = "flip-modal__content";
  modal.append(modalContent);
  document.body.append(modal);

  const getInteractiveCards = () =>
    Array.from(
      document.querySelectorAll(
        ".project-panel, .personal-card, .pictures-section__grid figure, .gallery-section__grid figure"
      )
    );

  const setScrollLocked = (isLocked) => {
    document.body.classList.toggle("is-flip-modal-open", isLocked);

    if (activeViewport) {
      activeViewport.classList.toggle("is-scroll-locked", isLocked);
    }

  };

  const makePlaceholder = (card, rect) => {
    const placeholder = document.createElement(card.tagName === "IMG" ? "span" : "div");

    placeholder.className = "flip-placeholder";
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;

    return placeholder;
  };

  const openModal = (card, event) => {
    if (event && event.target.closest(interactiveSelector)) {
      return;
    }

    if (isAnimating || activeCard || prefersReducedMotion.matches) {
      return;
    }

    activeCard = card;
    activeParent = card.parentElement;
    activeNextSibling = card.nextSibling;
    activeViewport = card.closest(".horizontal-scroll, .pictures-section__viewport, .gallery-section__viewport");

    const firstRect = card.getBoundingClientRect();
    const state = Flip.getState(card);

    activePlaceholder = makePlaceholder(card, firstRect);
    card.classList.add("is-flip-active");
    card.after(activePlaceholder);
    modalContent.append(card);
    card.getBoundingClientRect();
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    setScrollLocked(true);
    document.body.classList.add("is-frame-dimmed");
    isAnimating = true;

    gsap.to(modal, {
      opacity: 1,
      duration: 0.34,
      ease: "power3.out",
    });

    Flip.from(state, {
      duration: 0.78,
      ease: "power4.inOut",
      absolute: true,
      scale: true,
      nested: true,
      onComplete: () => {
        isAnimating = false;
      },
    });
  };

  const closeModal = () => {
    if (isAnimating || !activeCard || !activePlaceholder || !activeParent) {
      return;
    }

    const state = Flip.getState(activeCard);

    if (activeNextSibling && activeNextSibling.parentElement === activeParent) {
      activeParent.insertBefore(activeCard, activeNextSibling);
    } else {
      activeParent.append(activeCard);
    }

    activePlaceholder.remove();
    document.body.classList.remove("is-frame-dimmed");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    isAnimating = true;

    gsap.to(modal, {
      opacity: 0,
      duration: 0.3,
      ease: "power3.out",
    });

    Flip.from(state, {
      duration: 0.86,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      nested: true,
      onComplete: () => {
        activeCard.classList.remove("is-flip-active");
        setScrollLocked(false);
        activeCard = null;
        activePlaceholder = null;
        activeParent = null;
        activeNextSibling = null;
        activeViewport = null;
        isAnimating = false;

        if (window.ScrollTrigger) {
          ScrollTrigger.refresh();
        }
      },
    });
  };

  getInteractiveCards().forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.addEventListener("click", (event) => openModal(card, event));
    card.addEventListener("keydown", (event) => {
      if (event.target.closest(interactiveSelector)) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card, event);
      }
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

function initLotties() {
  const lotties = Array.from(document.querySelectorAll("dotlottie-wc"));

  if (!lotties.length) {
    return;
  }

  const startAnimation = () => {
    lotties.forEach((lottie) => {
      lottie.setAttribute("autoplay", "");
      lottie.setAttribute("loop", "");

      if (typeof lottie.play === "function") {
        lottie.play();
      }

      if (lottie.ready && typeof lottie.ready.then === "function") {
        lottie.ready.then(() => {
          if (typeof lottie.play === "function") {
            lottie.play();
          }
        });
      }
    });
  };

  if (window.customElements && window.customElements.whenDefined) {
    window.customElements.whenDefined("dotlottie-wc").then(startAnimation);
  } else {
    window.addEventListener("load", startAnimation, { once: true });
  }

  window.addEventListener("load", startAnimation, { once: true });
  window.setTimeout(startAnimation, 500);
}

function initSkillCardMotion() {
  const cards = Array.from(document.querySelectorAll(".skill-card"));

  if (!cards.length) {
    return;
  }

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        skillObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.2,
    }
  );

  cards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 90}ms`;
    skillObserver.observe(card);
  });
}

function initRevealMotion() {
  const revealItems = Array.from(
    document.querySelectorAll(
      [
        ".section-heading",
        ".profile-card",
        ".project-panel",
        ".personal-card",
        ".pictures-section h2",
        ".pictures-section p",
        ".pictures-section__grid figure",
        ".gallery-section h2",
        ".gallery-section p",
        ".gallery-section__grid figure",
        ".contact-panel__eyebrow",
        ".contact-panel__title",
        ".contact-panel__description",
        ".contact-form",
        ".contact-panel__labels",
      ].join(", ")
    )
  );

  if (!revealItems.length) {
    return;
  }

  revealItems.forEach((item, index) => {
    item.classList.add("motion-enter");
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  });

  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
}

if (window.gsap && window.ScrollTrigger && window.Flip) {
  gsap.registerPlugin(ScrollTrigger, Flip);
} else if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

initHorizontalSections();
initFlipModal();
initLotties();
initRevealMotion();
initSkillCardMotion();
