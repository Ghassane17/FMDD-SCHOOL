import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../services/api_instructor';

const CreateCourse2 = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    image: null,
    category: '',
    language: '',
    level: '',
    modules: [],
    resources: [],
    exam: {
      title: '',
      instructions: '',
      questions: [],
      duration: 60,
      passingScore: 70
    }
  });

  // Basic validation
  const validateStep1 = () => {
    const errors = {};
    if (!courseData.title) errors.title = 'Title required';
    if (!courseData.description) errors.description = 'Description required';
    if (!courseData.category) errors.category = 'Category required';
    if (!courseData.language) errors.language = 'Language required';
    if (!courseData.level) errors.level = 'Level required';
    if (!courseData.image) errors.image = 'Image required';
    return errors;
  };

  const validateStep2 = () => {
    const errors = {};
    if (courseData.modules.length === 0) errors.modules = 'At least one module required';
    return errors;
  };

  const validateStep3 = () => {
    const errors = {};
    if (!courseData.exam.title) errors.examTitle = 'Exam title required';
    if (courseData.exam.questions.length === 0) errors.examQuestions = 'At least one question required';
    return errors;
  };

  // Navigation handlers
  const handleNextStep = () => {
    let errors = {};
    switch (currentStep) {
      case 1: errors = validateStep1(); break;
      case 2: errors = validateStep2(); break;
      case 3: errors = validateStep3(); break;
      default: break;
    }

    if (Object.keys(errors).length > 0) {
      console.error('Validation errors:', errors);
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Data handlers
  const handleGeneralInfoChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExamChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      exam: {
        ...prev.exam,
        [name]: value
      }
    }));
  };

  // Module handlers
  const handleAddModule = (module) => {
    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, { ...module, id: Date.now() }]
    }));
  };

  const handleRemoveModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module.id !== moduleId)
    }));
  };

  // Question handlers
  const handleAddQuestion = (question) => {
    setCourseData(prev => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: [...prev.exam.questions, { ...question, id: Date.now() }]
      }
    }));
  };

  const handleRemoveQuestion = (questionId) => {
    setCourseData(prev => ({
      ...prev,
      exam: {
        ...prev.exam,
        questions: prev.exam.questions.filter(q => q.id !== questionId)
      }
    }));
  };

  // Resource handlers
  const handleAddResource = (resource) => {
    setCourseData(prev => ({
      ...prev,
      resources: [...prev.resources, { ...resource, id: Date.now() }]
    }));
  };

  const handleRemoveResource = (resourceId) => {
    setCourseData(prev => ({
      ...prev,
      resources: prev.resources.filter(resource => resource.id !== resourceId)
    }));
  };

  // Course publication
  const handlePublishCourse = async () => {
    try {
      const formData = new FormData();

      // Add basic course information
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('category', courseData.category);
      formData.append('level', courseData.level);
      formData.append('language', courseData.language);

      // Add course thumbnail
      if (courseData.image) {
        formData.append('course_thumbnail', courseData.image);
      }

      // Add modules
      courseData.modules.forEach((module, index) => {
        formData.append(`modules[${index}][title]`, module.title);
        formData.append(`modules[${index}][type]`, module.type);
        formData.append(`modules[${index}][order]`, index);
        
        if (module.type === 'text') {
          formData.append(`modules[${index}][content]`, module.content);
        } else if (['pdf', 'image', 'video'].includes(module.type)) {
          formData.append(`modules[${index}][file]`, module.content);
        } else if (module.type === 'quiz') {
          module.content.questions.forEach((question, qIndex) => {
            formData.append(`modules[${index}][questions][${qIndex}][question]`, question.question);
            question.options.forEach((option, oIndex) => {
              formData.append(`modules[${index}][questions][${qIndex}][options][${oIndex}]`, option);
            });
            formData.append(`modules[${index}][questions][${qIndex}][correctAnswer]`, question.correctAnswer);
          });
        }
      });

      // Add exam data
      formData.append('exams[title]', courseData.exam.title);
      formData.append('exams[instructions]', courseData.exam.instructions);
      formData.append('exams[duration_min]', courseData.exam.duration);
      formData.append('exams[passing_score]', courseData.exam.passingScore);

      // Add exam questions
      courseData.exam.questions.forEach((question, index) => {
        formData.append(`exams[questions][${index}][question]`, question.question);
        question.options.forEach((option, oIndex) => {
          formData.append(`exams[questions][${index}][options][${oIndex}]`, option);
        });
        formData.append(`exams[questions][${index}][correctAnswer]`, question.correctAnswer);
      });

      // Add resources
      courseData.resources.forEach((resource, index) => {
        formData.append(`course_resources[${index}][name]`, resource.name);
        formData.append(`course_resources[${index}][type]`, resource.type);
        
        if (['pdf', 'video', 'image'].includes(resource.type)) {
          formData.append(`course_resources[${index}][file]`, resource.file);
        } else {
          formData.append(`course_resources[${index}][url]`, resource.url);
        }
      });

      const response = await createCourse(formData);
      console.log('Course created successfully:', response);
      navigate('/instructor/courses');

    } catch (error) {
      console.error('Error creating course:', error);
    }
  };

  return (
    <div>
      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div>
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
          <select
            name="level"
            value={courseData.level}
            onChange={handleGeneralInfoChange}
          >
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                setCourseData(prev => ({
                  ...prev,
                  image: e.target.files[0]
                }));
              }
            }}
          />
        </div>
      )}

      {/* Step 2: Modules */}
      {currentStep === 2 && (
        <div>
          <button onClick={() => handleAddModule({
            title: 'New Module',
            type: 'text',
            content: ''
          })}>
            Add Module
          </button>
          {courseData.modules.map(module => (
            <div key={module.id}>
              <span>{module.title}</span>
              <button onClick={() => handleRemoveModule(module.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Exam */}
      {currentStep === 3 && (
        <div>
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
          <button onClick={() => handleAddQuestion({
            question: 'New Question',
            options: ['', '', '', ''],
            correctAnswer: 0
          })}>
            Add Question
          </button>
          {courseData.exam.questions.map(question => (
            <div key={question.id}>
              <span>{question.question}</span>
              <button onClick={() => handleRemoveQuestion(question.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Step 4: Resources */}
      {currentStep === 4 && (
        <div>
          <button onClick={() => handleAddResource({
            name: 'New Resource',
            type: 'pdf',
            file: null,
            url: ''
          })}>
            Add Resource
          </button>
          {courseData.resources.map(resource => (
            <div key={resource.id}>
              <span>{resource.name}</span>
              <button onClick={() => handleRemoveResource(resource.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Step 5: Review & Publish */}
      {currentStep === 5 && (
        <div>
          <h2>Review Course</h2>
          <pre>{JSON.stringify(courseData, null, 2)}</pre>
          <button onClick={handlePublishCourse}>Publish Course</button>
        </div>
      )}

      {/* Navigation */}
      <div>
        {currentStep > 1 && (
          <button onClick={handlePrevStep}>Previous</button>
        )}
        {currentStep < 5 ? (
          <button onClick={handleNextStep}>Next</button>
        ) : (
          <button onClick={handlePublishCourse}>Publish</button>
        )}
      </div>
    </div>
  );
};

export default CreateCourse2;
