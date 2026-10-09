/* data.js | البيانات الوهمية (mock data). شكلها نفس شكل جداول الداتابيس لاحقاً:
   كل شي إله id، والربط بين الجداول بـ foreign key مثل categoryId.
   الصفحات ما بتقرا من هون مباشرة، بتسأل dataService.js */

const siteInfo = { name: "HobbyHub", tagline: "Discover • Learn • Connect • Grow", year: 2026 };

// يوزر وهمي "مسجل" (للترحيب بالداشبورد)
const currentUser = { id: "userMarwa", name: "Marwa" };

// جدول الكاتيجوريز (tint = لون الخلفية الناعم: pink / orange / green)
const categories = [
  { id: "creative", name: "Creative", emoji: "🎨", tint: "pink" },
  { id: "musicDance", name: "Music & Dance", emoji: "🎸", tint: "orange" },
  { id: "outdoorAdventure", name: "Outdoor & Adventure", emoji: "🥾", tint: "green" },
  { id: "sportsFitness", name: "Sports & Fitness", emoji: "⚽", tint: "orange" },
  { id: "foodHome", name: "Food & Home", emoji: "🍳", tint: "pink" },
  { id: "gamesMind", name: "Games & Mind", emoji: "♟️", tint: "green" }
];

// جدول الهوايات (كل هواية تابعة لكاتيجوري عن طريق categoryId)
const hobbies = [
  { id: "drawing", name: "Drawing", categoryId: "creative" },
  { id: "calligraphy", name: "Calligraphy", categoryId: "creative" },
  { id: "photography", name: "Photography", categoryId: "creative" },
  { id: "pottery", name: "Pottery", categoryId: "creative" },
  { id: "crochet", name: "Crochet", categoryId: "creative" },
  { id: "tatreez", name: "Tatreez", categoryId: "creative" },
  { id: "accessoriesHandicrafts", name: "Accessories & Handicrafts", categoryId: "creative" },
  { id: "guitar", name: "Guitar", categoryId: "musicDance" },
  { id: "oud", name: "Oud", categoryId: "musicDance" },
  { id: "singing", name: "Singing", categoryId: "musicDance" },
  { id: "piano", name: "Piano", categoryId: "musicDance" },
  { id: "dabke", name: "Dabke", categoryId: "musicDance" },
  { id: "modernDance", name: "Modern Dance", categoryId: "musicDance" },
  { id: "hiking", name: "Hiking", categoryId: "outdoorAdventure" },
  { id: "camping", name: "Camping", categoryId: "outdoorAdventure" },
  { id: "snorkeling", name: "Snorkeling", categoryId: "outdoorAdventure" },
  { id: "windsurfing", name: "Windsurfing", categoryId: "outdoorAdventure" },
  { id: "cycling", name: "Cycling", categoryId: "outdoorAdventure" },
  { id: "football", name: "Football", categoryId: "sportsFitness" },
  { id: "running", name: "Running", categoryId: "sportsFitness" },
  { id: "swimming", name: "Swimming", categoryId: "sportsFitness" },
  { id: "tennis", name: "Tennis", categoryId: "sportsFitness" },
  { id: "padel", name: "Padel", categoryId: "sportsFitness" },
  { id: "cooking", name: "Cooking", categoryId: "foodHome" },
  { id: "bakingDesserts", name: "Baking & Desserts", categoryId: "foodHome" },
  { id: "homeGardening", name: "Home Gardening", categoryId: "foodHome" },
  { id: "coffeeBrewing", name: "Coffee Brewing", categoryId: "foodHome" },
  { id: "chess", name: "Chess", categoryId: "gamesMind" },
  { id: "tawleh", name: "Tawleh", categoryId: "gamesMind" },
  { id: "reading", name: "Reading", categoryId: "gamesMind" },
  { id: "groupBoardGames", name: "Group Board Games", categoryId: "gamesMind" }
];

// جدول الأنشطة (class / event / training). priceJod = 0 يعني مجاني. isFeatured = الأدمن علّم عليه
const activities = [
  { id: "actPhotographyBasics", title: "Photography Basics", type: "Training", hobbyId: "photography", priceJod: 10, isFeatured: true },
  { id: "actBeginnerWatercolor", title: "Beginner Watercolor", type: "Class", hobbyId: "drawing", priceJod: 0, isFeatured: true },
  { id: "actWeekendSketchWalk", title: "Weekend Sketch Walk", type: "Event", hobbyId: "drawing", priceJod: 0, isFeatured: true }
];

// خطوات "How HobbyHub Works" (route = اسم الصفحة اللي بيفتحها الكرت من routes بملف utils.js)
const howSteps = [
  { id: "stepDiscover", num: "01", title: "Discover", text: "Find a hobby that matches your interests and free time.", route: "discover" },
  { id: "stepLearn", num: "02", title: "Learn", text: "Join classes, events or training that fit your level.", route: "classes" },
  { id: "stepConnect", num: "03", title: "Connect", text: "Ask questions and share tips with hobby communities.", route: "groups" },
  { id: "stepGrow", num: "04", title: "Grow", text: "Set goals, track milestones and keep your journey moving.", route: "journey" }
];

// الأسئلة الشائعة
const faqs = [
  { id: "faq1", question: "What is HobbyHub?", answer: "HobbyHub is a platform for discovering hobbies, joining learning activities, connecting with hobby communities, and tracking personal progress." },
  { id: "faq2", question: "Do I need an account to explore HobbyHub?", answer: "No. You can browse hobbies, classes and communities without an account. A free account lets you enroll, join communities, save your quiz results and track your journey." },
  { id: "faq3", question: "How does Hobby Discovery work?", answer: "You answer a short quiz about your interests, free time, budget and activity style. We match your answers to hobbies and show your top matches with simple next steps." },
  { id: "faq4", question: "Can I join more than one hobby community?", answer: "Yes. Join as many communities as you like and manage them any time from the Communities page." }
];
