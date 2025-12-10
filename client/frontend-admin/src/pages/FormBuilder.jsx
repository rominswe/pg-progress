import React, { useState } from 'react';
import { Plus, Trash2, List, Target, FileSignature, Save, ChevronDown } from 'lucide-react';

// Utility function
import { cn } from '../lib/utils'; // ../lib because pages/FormBuilder.jsx -> lib/utils.js

// Components
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';


// --- 1. CORE DATA STRUCTURE DEFINITIONS ---

// The list of input types the Form Builder supports
const FIELD_TYPES = [
  { value: 'text', label: 'Short Text Input' },
  { value: 'textarea', label: 'Long Text Area' },
  { value: 'dropdown', label: 'Dropdown Selection' },
  { value: 'file', label: 'File Upload' },
];

const EMPTY_FIELD_DEFINITION = {
  // Use a timestamp or unique ID for the key/id temporarily
  key: `field_${Date.now()}`, 
  label: 'New Field Label',
  type: 'text',
  required: false,
  options: [],
};

const INITIAL_FORM_TEMPLATE = {
  id: 'temp-id-001',
  name: 'New Dynamic Form',
  targetRole: 'student',
  fields: [],
};


// --- 2. MAIN COMPONENT: FormBuilderPage ---

export default function FormBuilderPage() {
  const [formTemplate, setFormTemplate] = useState(INITIAL_FORM_TEMPLATE);
  
  // --- Core CRUD Logic for Fields ---

  const handleAddField = (type = 'text') => {
    const newField = { 
      ...EMPTY_FIELD_DEFINITION, 
      type: type,
      key: `field_${Date.now()}` // Ensure key is unique
    };
    setFormTemplate(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
  };

  const handleUpdateField = (index, property, value) => {
    setFormTemplate(prev => {
      const updatedFields = [...prev.fields];
      updatedFields[index] = {
        ...updatedFields[index],
        [property]: value,
      };
      return { ...prev, fields: updatedFields };
    });
  };

  const handleDeleteField = (index) => {
    setFormTemplate(prev => {
      const newFields = prev.fields.filter((_, i) => i !== index);
      return { ...prev, fields: newFields };
    });
  };

  // --- Utility Handlers ---
  
  const handleUpdateTemplateProperty = (property, value) => {
    setFormTemplate(prev => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleUpdateOptions = (index, optionsString) => {
    const optionsArray = optionsString.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
    handleUpdateField(index, 'options', optionsArray);
  };
  
  const handleMockSave = () => {
    console.log("FORM SAVED TO BACKEND (MOCKED):", formTemplate);
    alert('Form Template Saved! Check console for JSON structure.');
    // Here, you would replace this mock with your actual API POST call.
    // e.g., apiClient.post('/api/forms/template', formTemplate)
  };

  // --- Rendering UI Sections ---
  
  const renderFieldEditor = (field, index) => {
    const isDropdown = field.type === 'dropdown';

    return (
      <div 
        key={field.key} 
        className="border border-border p-4 rounded-lg bg-white shadow-sm flex flex-col gap-3"
      >
        <div className="flex justify-between items-start">
          <span className="text-xs font-semibold uppercase text-primary">Field #{index + 1}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => handleDeleteField(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Field Label and Key */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Label (Displayed to user)</label>
            <Input
              value={field.label}
              onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
              placeholder="e.g., Project Title"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Key (Backend ID)</label>
            <Input
              value={field.key}
              onChange={(e) => handleUpdateField(index, 'key', e.target.value.replace(/\s/g, '_').toLowerCase())}
              placeholder="e.g., project_title (no spaces)"
            />
          </div>
        </div>

        {/* Type and Required */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
                <label className="text-sm font-medium">Input Type</label>
                <Select
                    value={field.type}
                    onValueChange={(value) => handleUpdateField(index, 'type', value)}
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                        {FIELD_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            <div className="flex items-end pb-1">
                <div className="flex items-center space-x-2">
                    <input
                        id={`required-${field.key}`}
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => handleUpdateField(index, 'required', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor={`required-${field.key}`} className="text-sm font-medium text-gray-900">
                        Required Field
                    </label>
                </div>
            </div>
        </div>

        {/* Options Editor (Only for Dropdowns) */}
        {isDropdown && (
          <div className="space-y-1 pt-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <List className="h-4 w-4" /> Dropdown Options (Comma Separated)
            </label>
            <Input
              value={field.options.join(', ')}
              onChange={(e) => handleUpdateOptions(index, e.target.value)}
              placeholder="Option 1, Option 2, Another Choice"
            />
          </div>
        )}
      </div>
    );
  };

  // --- Component Return ---

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
        <FileSignature className="h-7 w-7" /> Dynamic Form Builder
      </h1>
      <p className="text-muted-foreground">
        Create and manage form templates for Students and Supervisors.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT PANEL: Form Settings & Add Field Buttons */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-card p-4 rounded-lg shadow-md border space-y-4">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
              <Target className="h-5 w-5" /> Form Details
            </h3>

            {/* Form Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={formTemplate.name}
                onChange={(e) => handleUpdateTemplateProperty('name', e.target.value)}
                placeholder="e.g., Thesis Submission Form V2"
              />
            </div>
            
            {/* Target Role */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Target User Role</label>
              <Select
                value={formTemplate.targetRole}
                onValueChange={(value) => handleUpdateTemplateProperty('targetRole', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="all">All Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
                onClick={handleMockSave} 
                className="w-full mt-4"
                disabled={formTemplate.fields.length === 0 || !formTemplate.name}
            >
              <Save className="h-4 w-4 mr-2" /> Save & Deploy Template
            </Button>
            
          </div>
          
          <div className="bg-card p-4 rounded-lg shadow-md border space-y-3">
            <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
              <Plus className="h-5 w-5" /> Add New Field
            </h3>
            
            {/* Add Field Buttons */}
            {FIELD_TYPES.map(type => (
              <Button 
                key={type.value}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleAddField(type.value)}
              >
                <Plus className="h-4 w-4 mr-2 text-primary" /> Add {type.label}
              </Button>
            ))}
            
          </div>
        </div>

        {/* RIGHT PANEL: Field Editor & Preview */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Form Fields ({formTemplate.fields.length})</h2>
          
          {formTemplate.fields.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
                  <FileSignature className="h-8 w-8 mx-auto mb-2" />
                  <p>Start building your form by adding a new field from the left panel.</p>
              </div>
          ) : (
            <div className="space-y-4">
              {formTemplate.fields.map(renderFieldEditor)}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}