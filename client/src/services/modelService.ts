/**
 * Model Service for handling SysML model saving and loading operations
 */
import { SysMLModel } from '@/types';
import { apiRequest } from '@/lib/queryClient';
import { useAppStore } from '@/lib/store';

/**
 * Save the model to a file
 * @param model The SysML model to save
 * @param filename Optional filename (defaults to project.sysml)
 */
export async function saveModelToFile(model: SysMLModel, filename = 'project.sysml'): Promise<boolean> {
  try {
    // Serialize model to JSON
    const modelJson = JSON.stringify(model, null, 2);
    
    // Send to server to save
    await apiRequest(
      'POST',
      `/api/models/save`,
      {
        filename,
        content: modelJson,
      }
    );
    
    // Update status message
    useAppStore.getState().setStatusMessage({
      text: `Model saved to ${filename}`,
      type: 'success',
    });
    
    // Mark as not dirty after successful save
    useAppStore.getState().setIsDirty(false);
    
    return true;
  } catch (error) {
    // Update status message with error
    useAppStore.getState().setStatusMessage({
      text: `Failed to save model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error',
    });
    console.error('Error saving model:', error);
    return false;
  }
}

/**
 * Load a model from a file
 * @param filename The filename to load (defaults to project.sysml)
 */
export async function loadModelFromFile(filename = 'project.sysml'): Promise<SysMLModel | null> {
  try {
    // Request the model file from the server
    const response = await apiRequest(
      'GET',
      `/api/models/load?filename=${encodeURIComponent(filename)}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to load model: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.content) {
      throw new Error('Invalid model file format');
    }
    
    // Parse the model JSON
    const model: SysMLModel = JSON.parse(data.content);
    
    // Update status message
    useAppStore.getState().setStatusMessage({
      text: `Model loaded from ${filename}`,
      type: 'success',
    });
    
    return model;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      // File not found is not necessarily an error - might be first run
      useAppStore.getState().setStatusMessage({
        text: 'Creating new model',
        type: 'info',
      });
      return null;
    }
    
    // Update status message with error
    useAppStore.getState().setStatusMessage({
      text: `Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`,
      type: 'error',
    });
    console.error('Error loading model:', error);
    return null;
  }
}

/**
 * Set up event listener for beforeunload to check for unsaved changes
 */
export function setupBeforeUnloadListener(): void {
  window.addEventListener('beforeunload', (event) => {
    // If there are unsaved changes, show a confirmation dialog
    if (useAppStore.getState().isDirty) {
      // Standard way to show a confirmation dialog before page unload
      event.preventDefault();
      event.returnValue = '';
      return '';
    }
  });
}

/**
 * Auto-save the current model
 */
export async function autoSaveModel(): Promise<boolean> {
  // Get the current model from the store
  const state = useAppStore.getState();
  
  // Only save if the model is dirty
  if (!state.isDirty) {
    return true;
  }
  
  try {
    const model = state.saveModel();
    await saveModelToFile(model, 'autosave.sysml');
    
    // Update the status message silently (no notification)
    state.setStatusMessage({
      text: 'Auto-saved',
      type: 'info',
    });
    
    return true;
  } catch (error) {
    console.error('Auto-save failed:', error);
    return false;
  }
}

/**
 * Set up periodic auto-save
 * @param intervalMs Interval in milliseconds between auto-saves
 */
export function setupAutoSave(intervalMs = 60000): () => void {
  // Set up an interval for auto-saving
  const intervalId = setInterval(autoSaveModel, intervalMs);
  
  // Return a function to cancel the auto-save
  return () => clearInterval(intervalId);
}