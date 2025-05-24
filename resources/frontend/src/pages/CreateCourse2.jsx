import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateCourse2 = () => {
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

  // Handle general course info changes
  const handleGeneralInfoChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle module management
  const [newModule, setNewModule] = useState({
    title: '',
    type: 'text',
    content: ''
  });

  const handleAddModule = () => {
    setCourseData(prevData => ({
      ...prevData,
      modules: [...prevData.modules, { ...newModule, id: Date.now() }]
    }));
    setNewModule({
      title: '',
      type: 'text',
      content: ''
    });
  };

  const handleRemoveModule = (moduleId) => {
    setCourseData(prevData => ({
      ...prevData,
      modules: prevData.modules.filter(module => module.id !== moduleId)
    }));
  };

  // Handle exam management
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const handleAddQuestion = () => {
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

  // Handle file uploads
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
    console.log('Course Data Structure:', courseData);
    // Here you would typically send the data to your backend
    navigate('/');
  };

  // Navigation between steps
  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2>General Information</h2>
            <input
              type="text"
              name="title"
              value={courseData.title}
              onChange={handleGeneralInfoChange}
              placeholder="Course Title"
            />
            <textarea
              name="description"
              value={courseData.description}
              onChange={handleGeneralInfoChange}
              placeholder="Course Description"
            />
            <select
              name="category"
              value={courseData.category}
              onChange={handleGeneralInfoChange}
            >
              <option value="">Select Category</option>
              <option value="development">Development</option>
              <option value="business">Business</option>
              <option value="design">Design</option>
            </select>
            <select
              name="language"
              value={courseData.language}
              onChange={handleGeneralInfoChange}
            >
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="ar">Arabic</option>
            </select>
            <input
              type="file"
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
          </div>
        );

      case 2:
        return (
          <div>
            <h2>Modules</h2>
            <input
              type="text"
              value={newModule.title}
              onChange={(e) => setNewModule(prev => ({...prev, title: e.target.value}))}
              placeholder="Module Title"
            />
            <select
              value={newModule.type}
              onChange={(e) => setNewModule(prev => ({...prev, type: e.target.value}))}
            >
              <option value="text">Text</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            {newModule.type === 'text' && (
              <textarea
                value={newModule.content}
                onChange={(e) => setNewModule(prev => ({...prev, content: e.target.value}))}
                placeholder="Module Content"
              />
            )}
            {['pdf', 'image', 'video'].includes(newModule.type) && (
              <input
                type="file"
                accept={newModule.type === 'pdf' ? '.pdf' : newModule.type === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileUpload}
              />
            )}
            <button onClick={handleAddModule}>Add Module</button>
            <div>
              {courseData.modules.map(module => (
                <div key={module.id}>
                  <h3>{module.title}</h3>
                  <p>Type: {module.type}</p>
                  <button onClick={() => handleRemoveModule(module.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2>Final Exam</h2>
            <input
              type="text"
              name="title"
              value={courseData.exam.title}
              onChange={handleExamChange}
              placeholder="Exam Title"
            />
            <textarea
              name="instructions"
              value={courseData.exam.instructions}
              onChange={handleExamChange}
              placeholder="Exam Instructions"
            />
            <input
              type="number"
              name="duration"
              value={courseData.exam.duration}
              onChange={handleExamChange}
              placeholder="Duration (minutes)"
            />
            <input
              type="number"
              name="passingScore"
              value={courseData.exam.passingScore}
              onChange={handleExamChange}
              placeholder="Passing Score (%)"
            />
            <div>
              <input
                type="text"
                value={newQuestion.question}
                onChange={(e) => setNewQuestion(prev => ({...prev, question: e.target.value}))}
                placeholder="Question"
              />
              {newQuestion.options.map((option, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={newQuestion.correctAnswer === index}
                    onChange={() => setNewQuestion(prev => ({...prev, correctAnswer: index}))}
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleQuestionOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>
              ))}
              <button onClick={handleAddQuestion}>Add Question</button>
            </div>
            <div>
              {courseData.exam.questions.map(question => (
                <div key={question.id}>
                  <h3>{question.question}</h3>
                  <ul>
                    {question.options.map((option, index) => (
                      <li key={index}>
                        {option} {index === question.correctAnswer ? '(Correct)' : ''}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => handleRemoveQuestion(question.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2>Review & Publish</h2>
            <pre>{JSON.stringify(courseData, null, 2)}</pre>
            <button onClick={handlePublishCourse}>Publish Course</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div>
        <button onClick={handlePrevStep} disabled={currentStep === 1}>Previous</button>
        <span>Step {currentStep} of 4</span>
        <button onClick={handleNextStep} disabled={currentStep === 4}>Next</button>
      </div>
      {renderStep()}
    </div>
  );
};

export default CreateCourse2; 