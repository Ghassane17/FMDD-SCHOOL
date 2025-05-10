
/**
 * Dummy course data for the course player
 * In a real application, this would come from an API
 */
export const dummyCourseData = {
  id: 1,
  title: "Introduction au Développement Web",
  description: "Apprenez les bases du développement web moderne.",
  progress: 35, // Overall course completion percentage
  modules: [
    {
      id: 1,
      title: "Fondamentaux du HTML",
      description: "Découvrez la structure des pages web et les éléments HTML essentiels.",
      duration: "45 min",
      contentType: "video", // Type of content: video, pdf, quiz, image
      contentUrl: "/src/assets/CourseContent/HTMLIntroduction.mp4", // Placeholder URL
      status: "completed", // completed, in-progress, not-started
      resources: [
        { name: "Cheatsheet HTML", url: "#" },
        { name: "Exercices pratiques", url: "#" },
      ]
    },
    {
      id: 2,
      title: "CSS et Mise en Page",
      description: "Appliquez des styles et créez des mises en page réactives.",
      duration: "1h 15min",
      contentType: "pdf", // PDF document
      contentUrl: "/src/assets/CourseContent/HTML_CSS_JQuery.pdf", // Placeholder URL
      status: "in-progress",
      resources: [
        { name: "Guide des Flexbox", url: "#" },
        { name: "Exemples de code", url: "#" },
      ]
    },
    {
      id: 3,
      title: "Introduction à JavaScript",
      description: "Les bases de la programmation avec JavaScript.",
      duration: "1h 30min",
      contentType: "quiz", // Interactive quiz
      contentUrl: "", // Quiz content would be structured data, not a URL
      quizQuestions: [
        {
          question: "Quelle est la syntaxe correcte pour créer une variable en JavaScript?",
          options: ["#var name", "var name", "variable name", "v name"],
          correctAnswer: 1
        },
        {
          question: "Comment écrire une condition IF en JavaScript?",
          options: ["if i = 5 then", "if i == 5", "if i = 5", "if (i == 5)"],
          correctAnswer: 3
        }
      ],
      status: "not-started",
      resources: [
        { name: "Documentation JS", url: "#" },
        { name: "Projets pratiques", url: "#" },
      ]
    },
    {
      id: 4,
      title: "Responsive Design",
      description: "Créez des sites web adaptés à tous les appareils.",
      duration: "55 min",
      contentType: "image", // Just an image/infographic
      contentUrl: "/src/assets/CourseContent/ResponsiveDesign.jpg", // Placeholder image
      status: "not-started",
      resources: [
        { name: "Techniques avancées", url: "#" },
        { name: "Tests de compatibilité", url: "#" },
      ]
    },
    {
      id: 5,
      title: "Frameworks Frontend",
      description: "Exploration des frameworks populaires comme React et Vue.",
      duration: "1h 45min",
      contentType: "video", // Video again
      contentUrl: "/src/assets/CourseContent/FrameworksFrontend.mp4", // Placeholder URL
      status: "not-started",
      resources: [
        { name: "Comparatif des frameworks", url: "#" },
        { name: "Setup de projet", url: "#" },
      ]
    }
  ]
};
