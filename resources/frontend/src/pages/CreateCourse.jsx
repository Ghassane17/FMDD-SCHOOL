
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Trash, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  FileUp
} from 'lucide-react';

// Course Creation Page
const CreateCourse = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    image: null,
    category: '',
    language: '',
    modules: [],
    exam: {
      title: '',
      instructions: '',
      questions: [],
      duration: 60,
      passingScore: 70
    }
  });
  
  // Load initial data from navigation state
  useEffect(() => {
    if (location.state?.courseData) {
      setCourseData(prevData => ({
        ...prevData,
        title: location.state.courseData.title || '',
        description: location.state.courseData.description || '',
        image: location.state.courseData.image || null
      }));
    }
  }, [location.state]);
  
  // Handle navigating between steps
  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  // Handle general course info changes
  const handleGeneralInfoChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle creating and managing modules
  const [newModule, setNewModule] = useState({
    title: '',
    type: 'text',
    content: ''
  });
  
  const handleAddModule = () => {
    if (newModule.title.trim()) {
      setCourseData(prevData => ({
        ...prevData,
        modules: [...prevData.modules, { ...newModule, id: Date.now() }]
      }));
      setNewModule({
        title: '',
        type: 'text',
        content: ''
      });
    }
  };
  
  const handleRemoveModule = (moduleId) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.filter(module => module.id !== moduleId)
    }));
  };
  
  // Handle creating and managing exam questions
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });
  
  const handleAddQuestion = () => {
    if (newQuestion.question.trim()) {
      setCourseData(prevData => ({
        ...prevData,
        exam: {
          ...prevData.exam,
          questions: [...prevData.exam.questions, { ...newQuestion, id: Date.now() }]
        }
      }));
      setNewQuestion({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      });
    }
  };
  
  const handleRemoveQuestion = (questionId) => {
    setCourseData(prevData => ({
      ...prevData,
      exam: {
        ...prevData.exam,
        questions: prevData.exam.questions.filter(q => q.id !== questionId)
      }
    }));
  };
  
  const handleExamChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prevData => ({
      ...prevData,
      exam: {
        ...prevData.exam,
        [name]: value
      }
    }));
  };
  
  const handleQuestionOptionChange = (index, value) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };
  
  // Handle file uploads for different content types
  const handleFileUpload = (e) => {
    if (e.target.files[0]) {
      setNewModule(prev => ({
        ...prev,
        content: URL.createObjectURL(e.target.files[0])
      }));
    }
  };
  
  // Handle course publication
  const handlePublishCourse = () => {
    console.log('Publishing course:', courseData);
    // Here you would typically send the data to your backend
    navigate('/');
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Informations générales du cours</h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Titre complet du cours</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleGeneralInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre complet du cours"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Description détaillée</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleGeneralInfoChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="5"
                  placeholder="Description détaillée du cours..."
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Catégorie</label>
                  <select
                    name="category"
                    value={courseData.category}
                    onChange={handleGeneralInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="development">Développement</option>
                    <option value="business">Business</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="datascience">Data Science</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Langue</label>
                  <select
                    name="language"
                    value={courseData.language}
                    onChange={handleGeneralInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une langue</option>
                    <option value="ar">Arabe</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="es">Espagnol</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Image de couverture</label>
                {courseData.image ? (
                  <div className="relative mb-4">
                    <img 
                      src={courseData.image} 
                      alt="Course cover" 
                      className="w-full h-48 object-cover rounded-lg" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setCourseData(prev => ({...prev, image: null}))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="courseImage"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setCourseData(prev => ({
                            ...prev,
                            image: URL.createObjectURL(e.target.files[0])
                          }));
                        }
                      }}
                    />
                    <label htmlFor="courseImage" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <span className="text-gray-500">Cliquez pour ajouter une image</span>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Création des Modules</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Ajoutez autant de modules que nécessaire pour votre cours. 
                Chaque module peut contenir du texte, des PDF, des images, des vidéos ou des quiz.
              </p>
            </div>
            
            {courseData.modules.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Modules ajoutés</h3>
                <div className="space-y-3">
                  {courseData.modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2">
                            {index + 1}
                          </span>
                          <h4 className="font-medium">{module.title}</h4>
                        </div>
                        <div className="flex items-center">
                          {module.type === 'text' && <FileText className="h-4 w-4 text-gray-500 mr-1" />}
                          {module.type === 'pdf' && <FileUp className="h-4 w-4 text-gray-500 mr-1" />}
                          {module.type === 'image' && <ImageIcon className="h-4 w-4 text-gray-500 mr-1" />}
                          {module.type === 'video' && <Video className="h-4 w-4 text-gray-500 mr-1" />}
                          {module.type === 'quiz' && <BookOpen className="h-4 w-4 text-gray-500 mr-1" />}
                          <span className="text-sm text-gray-500 capitalize">{module.type}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveModule(module.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Ajouter un nouveau module</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Titre du module</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du module"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Type de contenu</label>
                  <select
                    value={newModule.type}
                    onChange={(e) => setNewModule(prev => ({...prev, type: e.target.value, content: ''}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="text">Texte</option>
                    <option value="pdf">PDF</option>
                    <option value="image">Image</option>
                    <option value="video">Vidéo</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>
                
                <div>
                  {newModule.type === 'text' && (
                    <div>
                      <label className="block text-gray-700 mb-2">Contenu</label>
                      <textarea
                        value={newModule.content}
                        onChange={(e) => setNewModule(prev => ({...prev, content: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Contenu du module..."
                      ></textarea>
                    </div>
                  )}
                  
                  {(newModule.type === 'pdf' || newModule.type === 'image' || newModule.type === 'video') && (
                    <div>
                      <label className="block text-gray-700 mb-2">
                        Fichier {newModule.type === 'pdf' ? 'PDF' : newModule.type === 'image' ? 'Image' : 'Vidéo'}
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          id="moduleFile"
                          className="hidden"
                          accept={
                            newModule.type === 'pdf' ? '.pdf' : 
                            newModule.type === 'image' ? 'image/*' : 
                            'video/*'
                          }
                          onChange={handleFileUpload}
                        />
                        {newModule.content ? (
                          <div className="relative">
                            {newModule.type === 'image' && (
                              <img 
                                src={newModule.content} 
                                alt="Module content" 
                                className="w-full h-40 object-contain" 
                              />
                            )}
                            {newModule.type === 'pdf' && (
                              <div className="flex items-center justify-center bg-gray-100 h-20 rounded">
                                <FileUp className="h-8 w-8 text-gray-500" />
                                <span className="ml-2">PDF téléchargé</span>
                              </div>
                            )}
                            {newModule.type === 'video' && (
                              <div className="flex items-center justify-center bg-gray-100 h-20 rounded">
                                <Video className="h-8 w-8 text-gray-500" />
                                <span className="ml-2">Vidéo téléchargée</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => setNewModule(prev => ({...prev, content: ''}))}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="moduleFile" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              {newModule.type === 'pdf' && <FileUp className="h-10 w-10 text-gray-400 mb-2" />}
                              {newModule.type === 'image' && <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />}
                              {newModule.type === 'video' && <Video className="h-10 w-10 text-gray-400 mb-2" />}
                              <span className="text-gray-500">
                                Cliquez pour télécharger un {newModule.type === 'pdf' ? 'PDF' : newModule.type === 'image' ? 'une image' : 'une vidéo'}
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {newModule.type === 'quiz' && (
                    <div>
                      <label className="block text-gray-700 mb-2">Questions du quiz</label>
                      <textarea
                        value={newModule.content}
                        onChange={(e) => setNewModule(prev => ({...prev, content: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                        placeholder="Format: Question?|Réponse1|Réponse2|Réponse3|Réponse4|NuméroBonneRéponse"
                      ></textarea>
                      <p className="text-xs text-gray-500 mt-1">
                        Exemple: Quelle est la capitale de la France?|Paris|Londres|Berlin|Madrid|1
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter ce module
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Examen Final</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700">
                Créez un examen final pour évaluer les connaissances acquises dans ce cours.
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Titre de l'examen</label>
                <input
                  type="text"
                  name="title"
                  value={courseData.exam.title}
                  onChange={handleExamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Titre de l'examen final"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Instructions</label>
                <textarea
                  name="instructions"
                  value={courseData.exam.instructions}
                  onChange={handleExamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Instructions pour l'examen..."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Durée (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    min="5"
                    value={courseData.exam.duration}
                    onChange={handleExamChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Score de passage (%)</label>
                  <input
                    type="number"
                    name="passingScore"
                    min="1"
                    max="100"
                    value={courseData.exam.passingScore}
                    onChange={handleExamChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            {courseData.exam.questions.length > 0 && (
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Questions ajoutées</h3>
                <div className="space-y-3">
                  {courseData.exam.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2 mt-1">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium">{question.question}</h4>
                            <ul className="mt-2 space-y-1">
                              {question.options.map((option, i) => (
                                <li key={i} className="flex items-center">
                                  <span className={`w-4 h-4 rounded-full mr-2 ${i === question.correctAnswer ? 'bg-green-500' : 'bg-gray-200'}`}></span>
                                  {option}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Ajouter une nouvelle question</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2">Question</label>
                  <input
                    type="text"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({...prev, question: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre question..."
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 mb-2">Options</label>
                  {newQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newQuestion.correctAnswer === index}
                        onChange={() => setNewQuestion(prev => ({...prev, correctAnswer: index}))}
                        className="mr-2"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
                
                <div>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter cette question
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Résumé & Publication</h2>
            
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="font-bold text-lg mb-4">Informations générales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <p className="text-gray-500 text-sm">Titre</p>
                  <p className="font-medium">{courseData.title}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Catégorie</p>
                  <p className="font-medium">{courseData.category || "Non spécifiée"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Langue</p>
                  <p className="font-medium">{courseData.language || "Non spécifiée"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-gray-500 text-sm">Description</p>
                  <p className="text-sm">{courseData.description}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Modules ({courseData.modules.length})</h3>
              </div>
              {courseData.modules.length > 0 ? (
                <div className="space-y-3">
                  {courseData.modules.map((module, index) => (
                    <div key={module.id} className="border rounded-lg p-3">
                      <div className="flex items-center">
                        <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm mr-2">
                          {index + 1}
                        </span>
                        <h4 className="font-medium">{module.title}</h4>
                        <span className="ml-3 px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 capitalize">
                          {module.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucun module n'a été ajouté.</p>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Examen Final</h3>
              </div>
              {courseData.exam.title ? (
                <div>
                  <p><span className="font-medium">Titre:</span> {courseData.exam.title}</p>
                  <p><span className="font-medium">Durée:</span> {courseData.exam.duration} minutes</p>
                  <p><span className="font-medium">Score de passage:</span> {courseData.exam.passingScore}%</p>
                  <p className="mt-2"><span className="font-medium">Nombre de questions:</span> {courseData.exam.questions.length}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>Aucun examen n'a été configuré.</p>
                </div>
              )}
            </div>
            
            <div className="bg-green-50 rounded-lg p-6 flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold mb-1">Prêt à publier ?</h3>
                <p className="text-sm text-gray-700">
                  Votre cours sera soumis à vérification avant d'être publié sur la plateforme.
                </p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </button>
              <button
                type="button"
                onClick={handlePublishCourse}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center font-medium"
              >
                Publier le cours
                <Check className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Cours Section</h1>
            </div>
            <button 
              onClick={() => navigate('/formateurs')}
              className="text-gray-500 hover:text-gray-700"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-gray-700 mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <h1 className="text-2xl font-bold">Création d'un nouveau cours</h1>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex mb-2">
            {['Informations', 'Modules', 'Examen', 'Publication'].map((step, index) => (
              <div 
                key={step} 
                className={`flex-1 text-center ${index < currentStep ? 'text-blue-600' : 'text-gray-500'} ${index === 3 ? '' : 'border-b-2'} ${index < currentStep ? 'border-blue-600' : 'border-gray-200'}`}
              >
                <div 
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    index + 1 === currentStep ? 'bg-blue-600 text-white' : 
                    index + 1 < currentStep ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  } mb-2`}
                >
                  {index + 1 < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm pb-2">{step}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
