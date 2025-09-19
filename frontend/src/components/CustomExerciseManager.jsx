import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { 
  getUserCustomExercises, 
  createCustomExercise, 
  updateCustomExercise, 
  deleteCustomExercise 
} from '../services/customExercisesService';
import '../styles/custom-exercises.css';

const EXERCISE_CATEGORIES = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Other'
];

const CustomExerciseManager = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [exerciseForm, setExerciseForm] = useState({
    name: '',
    category: 'Other'
  });

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [isIPhone, setIsIPhone] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone/.test(userAgent);
      
      setIsIPhone(isIOS);
      setIsMobile(window.innerWidth < 768 || isIOS);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch exercises on component mount
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const data = await getUserCustomExercises();
      setExercises(data);
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(err.message || 'Failed to load custom exercises');
      toast.error('Failed to load custom exercises');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (exercise = null) => {
    if (exercise) {
      setEditingExercise(exercise);
      setExerciseForm({
        name: exercise.name,
        category: exercise.category
      });
    } else {
      setEditingExercise(null);
      setExerciseForm({
        name: '',
        category: 'Other'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExercise(null);
    setExerciseForm({
      name: '',
      category: 'Other'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExerciseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!exerciseForm.name.trim()) {
      toast.error('Exercise name is required');
      return;
    }
    
    try {
      if (editingExercise) {
        // Update existing exercise
        await updateCustomExercise(editingExercise.id, exerciseForm);
        toast.success('Exercise updated successfully');
      } else {
        // Create new exercise
        await createCustomExercise(exerciseForm);
        toast.success('Exercise created successfully');
      }
      
      // Refresh the list
      fetchExercises();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving exercise:', err);
      toast.error(err.message || 'Failed to save exercise');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this exercise?')) {
      try {
        await deleteCustomExercise(id);
        toast.success('Exercise deleted successfully');
        fetchExercises();
      } catch (err) {
        console.error('Error deleting exercise:', err);
        toast.error(err.message || 'Failed to delete exercise');
      }
    }
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">{error}</p>
        <button 
          onClick={fetchExercises}
          className="mt-4 gradient-primary text-primary-foreground px-4 py-2 rounded shadow-glow hover:shadow-glow transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`custom-exercise-manager ${isMobile ? 'mobile' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-foreground">My Custom Exercises</h2>
        <button
          onClick={() => handleOpenModal()}
          className={`gradient-primary text-primary-foreground ${isMobile ? 'p-2' : 'px-4 py-2'} rounded flex items-center shadow-glow hover:shadow-glow transition`}
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          <span className={isMobile ? 'text-sm' : ''}>Add Exercise</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : exercises.length === 0 ? (
        <div className="bg-muted rounded p-4 text-center my-4">
          <p className="text-muted-foreground">You haven't created any custom exercises yet.</p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 gradient-primary text-primary-foreground px-4 py-2 rounded shadow-glow hover:shadow-glow transition"
          >
            Create Your First Exercise
          </button>
        </div>
      ) : (
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
          {exercises.map(exercise => (
            <div key={exercise.id} className="bg-card rounded-lg shadow p-4 border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-semibold text-card-foreground ${isMobile ? 'text-base' : 'text-lg'}`}>{exercise.name}</h3>
                  <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-sm'}`}>{exercise.category}</p>
                </div>
                <div className="flex">
                  <button
                    onClick={() => handleOpenModal(exercise)}
                    className={`text-primary hover:text-primary/80 ${isMobile ? 'p-1' : 'p-2'}`}
                  >
                    <PencilIcon className={`h-5 w-5 ${isMobile ? 'h-4 w-4' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className={`text-destructive hover:text-destructive/80 ${isMobile ? 'p-1' : 'p-2'}`}
                  >
                    <TrashIcon className={`h-5 w-5 ${isMobile ? 'h-4 w-4' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Exercise Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className={`bg-card rounded-lg shadow-lg ${isIPhone ? 'w-full max-w-[350px]' : isMobile ? 'w-full max-w-[90%]' : 'w-full max-w-md'}`}
          >
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-card-foreground">
                {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-card-foreground">Exercise Name</label>
                <input
                  type="text"
                  name="name"
                  value={exerciseForm.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isIPhone ? 'text-base' : ''}`}
                  placeholder="Enter exercise name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-card-foreground">Category</label>
                <select
                  name="category"
                  value={exerciseForm.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-border rounded bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${isIPhone ? 'text-base' : ''}`}
                >
                  {EXERCISE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`px-4 py-2 border border-border rounded bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground ${isMobile ? 'text-sm' : ''}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 gradient-primary text-primary-foreground rounded shadow-glow hover:shadow-glow ${isMobile ? 'text-sm' : ''}`}
                >
                  {editingExercise ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomExerciseManager; 