/* dataService.js | المكان الوحيد اللي الصفحات بتطلب منه البيانات.
   هلأ بيرجّع بيانات data.js. لما نعمل الباك إند بنغيّر داخل كل دالة فقط، مثلاً:
       const response = await fetch("/api/categories");
       return response.json();
   وصفحاتنا ما بتتغير أبداً. الدوال async من هلأ عشان نتعود على الشكل النهائي. */

// الكاتيجوريز ومعها هواياتها
async function getCategories() {
  return categories.map((category) => ({
    ...category,                                                            // نسخ بيانات الكاتيجوري
    hobbies: hobbies.filter((hobby) => hobby.categoryId === category.id)    // وإضافة هواياتها
  }));
}

async function getHowSteps() { return howSteps; }

// الأنشطة اللي الأدمن علّم عليها Featured (مجانية أو مدفوعة)
async function getFeaturedActivities() { return activities.filter((activity) => activity.isFeatured); }

async function getFaqs() { return faqs; }

async function getCurrentUser() { return currentUser; }
