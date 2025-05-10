
export const trainerData = {
  id: 1,
  name: "Sophie Martin",
  avatar: "../assets/formateur_test/react_course.png",
  bio: "Expert en développement web et data science avec plus de 8 ans d'expérience. Passionnée par la transmission de connaissances et l'accompagnement de nouveaux talents.",
  skills: ["JavaScript", "React", "Python", "Data Science", "Machine Learning"],
  languages: [
    { name: "Français", code: "FR" },
    { name: "Anglais", code: "GB" },
    { name: "Espagnol", code: "ES" }
  ],
  certifications: [
    { name: "Master en Intelligence Artificielle", institution: "École Polytechnique" },
    { name: "AWS Certified Developer", institution: "Amazon Web Services" },
    { name: "Professional Scrum Master", institution: "Scrum.org" }
  ],
  courses: [
    { id: 1, title: "React pour débutants", students: 1243, rating: 4.8 , image: "src/assets/formateur_test/react_course.png" , level : "débutant" },
    { id: 2, title: "Data Science avec Python", students: 876, rating: 4.9, image: "/src/assets/formateur_test/python_course.png" , level : "intermédiaire" },
    { id: 3, title: "JavaScript Avancé", students: 654, rating: 4.7, image: "src/assets/formateur_test/javascript_course.png" , level : "avancé" },
    { id: 4, title: "Introduction au Machine Learning", students: 932, rating: 4.6, image: "src/assets/formateur_test/ML_course.png" , level : "intermédiaire" },
  ],
  availability: [
    { day: "Lundi", slots: ["10:00", "14:00", "16:00"] },
    { day: "Mercredi", slots: ["09:00", "11:00", "15:00"] },
    { day: "Vendredi", slots: ["10:00", "13:00", "17:00"] }
  ],
  stats: {
    totalCourses: 7,
    totalStudents: 3705,
    averageRating: 4.8
  },
  comments: [
    { id: 1, user: "Thomas D.", course: "React pour débutants", text: "Excellente formatrice, explications claires et exercices pratiques très utiles.", date: "15/04/2025", rating: 5 },
    { id: 2, user: "Marie L.", course: "Data Science avec Python", text: "Cours complet et bien structuré. Sophie est toujours disponible pour répondre aux questions.", date: "03/04/2025", rating: 5 },
    { id: 3, user: "Julien M.", course: "JavaScript Avancé", text: "J'ai beaucoup appris grâce à ce cours et aux conseils personnalisés de Sophie.", date: "28/03/2025", rating: 4 }
  ],
  bankInfo: {
    iban: "FR76 **** **** **** **** 1234",
    bankName: "Banque Nationale",
    paymentMethod: "Virement bancaire"
  },
  paymentHistory: [
    { id: 1, date: "30/03/2025", amount: 1243.50, description: "Versement des commissions - Mars 2025" },
    { id: 2, date: "28/02/2025", amount: 978.25, description: "Versement des commissions - Février 2025" },
    { id: 3, date: "31/01/2025", amount: 1102.75, description: "Versement des commissions - Janvier 2025" }
  ]
};
