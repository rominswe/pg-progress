import React, { useState } from 'react';
import { Plus, Trash2, List, Target, FileSignature, Save, ChevronDown, Activity, Settings, Layout, Code } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

// Utility function
import { cn } from '../../lib/utils';

// Components
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

// --- 1. CORE DATA STRUCTURE DEFINITIONS ---

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text Input' },
  { value: 'textarea', label: 'Long Text Area' },
  { value: 'dropdown', label: 'Dropdown Selection' },
  { value: 'file', label: 'File Upload' },
];

const EMPTY_FIELD_DEFINITION = {
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

export default function FormBuilderPage() {
  const [formTemplate, setFormTemplate] = useState(INITIAL_FORM_TEMPLATE);

  const handleAddField = (type = 'text') => {
    const newField = {
      ...EMPTY_FIELD_DEFINITION,
      type: type,
      key: `field_${Date.now()}`
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
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const renderFieldEditor = (field, index) => {
    const isDropdown = field.type === 'dropdown';

    return (
      <motion.div
        key={field.key}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-sm border border-blue-100">
              {index + 1}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Field Configuration</h4>
              <p className="text-xs font-bold text-blue-600">{FIELD_TYPES.find(t => t.value === field.type)?.label}</p>
            </div>
          </div>
          <button
            onClick={() => handleDeleteField(index)}
            className="p-2 text-slate-300 hover:text-blue-900 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Field Label</label>
            <Input
              value={field.label}
              onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
              className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 h-12"
              placeholder="e.g., Research Area"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              Backend Identifier <Code className="w-3 h-3" />
            </label>
            <Input
              value={field.key}
              onChange={(e) => handleUpdateField(index, 'key', e.target.value.replace(/\s/g, '_').toLowerCase())}
              className="rounded-2xl border-slate-200 bg-slate-50 font-mono text-xs focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 h-12"
              placeholder="e.g., research_area"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Input Strategy</label>
            <Select
              value={field.type}
              onValueChange={(value) => handleUpdateField(index, 'type', value)}
            >
              <SelectTrigger className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 h-12">
                <SelectValue placeholder="Select Strategy" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {FIELD_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 h-12 mt-6 px-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="relative inline-flex items-center cursor-pointer grow">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => handleUpdateField(index, 'required', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-bold text-slate-700">Mandatory Submission</span>
            </label>
          </div>
        </div>

        {isDropdown && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 mt-6 pt-6 border-t border-slate-100"
          >
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <List className="h-4 w-4 text-blue-600" /> Options (Comma Separated)
            </label>
            <Input
              value={field.options.join(', ')}
              onChange={(e) => handleUpdateOptions(index, e.target.value)}
              className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 h-12"
              placeholder="Under Review, Draft, Finalized"
            />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-full px-6 mx-auto pb-12"
    >
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3">
              <FileSignature className="w-8 h-8 text-white" />
              Dynamic Form Architect
            </h1>
            <p className="text-blue-100 font-medium text-lg">
              Design and deploy adaptive assessment forms for the postgraduate community.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleMockSave}
              disabled={formTemplate.fields.length === 0 || !formTemplate.name}
              className="px-8 py-3 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Deploy Template
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Global Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Name</label>
                <Input
                  value={formTemplate.name}
                  onChange={(e) => handleUpdateTemplateProperty('name', e.target.value)}
                  className="rounded-2xl border-slate-200 focus:border-blue-500 h-12"
                  placeholder="e.g., Progress Report V4.2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Audience</label>
                <Select
                  value={formTemplate.targetRole}
                  onValueChange={(value) => handleUpdateTemplateProperty('targetRole', value)}
                >
                  <SelectTrigger className="rounded-2xl border-slate-200 h-12">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="student">Student Body</SelectItem>
                    <SelectItem value="supervisor">Academic Supervisors</SelectItem>
                    <SelectItem value="all">Global Availability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-100 shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-600" />
                Structural Units
              </CardTitle>
              <Badge className="bg-blue-600">{FIELD_TYPES.length} Types</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {FIELD_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => handleAddField(type.value)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-slate-100 border-dashed hover:border-blue-200 hover:text-blue-700 transition-all group font-bold text-sm"
                >
                  <span className="text-slate-600 group-hover:text-blue-700">{type.label}</span>
                  <Plus className="h-4 w-4 text-slate-300 group-hover:text-blue-600" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Builder Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Layout className="w-6 h-6 text-blue-600" />
              Form Construction Area
            </h2>
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {formTemplate.fields.length} Components
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {formTemplate.fields.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-20 text-center rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 shadow-sm"
              >
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileSignature className="h-10 w-10 text-slate-200" />
                </div>
                <p className="text-lg font-bold text-slate-600">The canvas is currently empty</p>
                <p className="text-sm max-w-xs mx-auto mt-2">Add structural units from the left panel to begin designing your dynamic form.</p>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {formTemplate.fields.map(renderFieldEditor)}

                <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center opacity-50 bg-slate-50/50">
                  <Activity className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">End of Blueprint</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
