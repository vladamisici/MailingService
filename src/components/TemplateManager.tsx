'use client';

import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Code, 
  Save,
  X
} from 'lucide-react';

interface Template {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  type: 'html' | 'text';
  created: string;
  lastModified: string;
  usageCount: number;
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to {{company_name}}, {{first_name}}!',
      content: `<html>
<body>
<h1>Welcome {{first_name}}!</h1>
<p>Thank you for joining {{company_name}}. We're excited to have you on board.</p>
<p>Your account has been created with the email: {{email}}</p>
<a href="{{dashboard_url}}" style="background: #007AFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Get Started</a>
</body>
</html>`,
      variables: ['first_name', 'company_name', 'email', 'dashboard_url'],
      type: 'html',
      created: '2024-01-15',
      lastModified: '2024-01-20',
      usageCount: 142
    },
    {
      id: '2',
      name: 'Password Reset',
      subject: 'Reset your password',
      content: `Hi {{first_name}},

We received a request to reset your password. Click the link below to create a new password:

{{reset_link}}

This link will expire in 24 hours. If you didn't request this reset, please ignore this email.

Best regards,
The {{company_name}} Team`,
      variables: ['first_name', 'reset_link', 'company_name'],
      type: 'text',
      created: '2024-01-10',
      lastModified: '2024-01-18',
      usageCount: 89
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');

  const createNewTemplate = () => {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: 'New Template',
      subject: '',
      content: '',
      variables: [],
      type: 'html',
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setEditingTemplate(newTemplate);
    setIsEditing(true);
  };

  const editTemplate = (template: Template) => {
    setEditingTemplate({ ...template });
    setIsEditing(true);
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;

    // Extract variables from content
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;
    while ((match = variableRegex.exec(editingTemplate.content + editingTemplate.subject)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    const updatedTemplate = {
      ...editingTemplate,
      variables,
      lastModified: new Date().toISOString().split('T')[0]
    };

    if (templates.find(t => t.id === editingTemplate.id)) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? updatedTemplate : t));
    } else {
      setTemplates([...templates, updatedTemplate]);
    }

    setIsEditing(false);
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const duplicateTemplate = (template: Template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      created: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      usageCount: 0
    };
    setTemplates([...templates, newTemplate]);
  };

  const renderPreview = () => {
    if (!editingTemplate) return '';
    
    let preview = editingTemplate.content;
    editingTemplate.variables.forEach(variable => {
      const placeholder = `[${variable.toUpperCase()}]`;
      preview = preview.replace(new RegExp(`\\{\\{${variable}\\}\\}`, 'g'), placeholder);
    });
    
    return preview;
  };

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 animate-apple-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
              {editingTemplate?.id && templates.find(t => t.id === editingTemplate.id) ? 'Edit Template' : 'Create Template'}
            </h1>
            <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
              Design reusable email templates with dynamic variables
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingTemplate(null);
              }}
              className="apple-button-secondary flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={saveTemplate}
              className="apple-button-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="apple-card p-6">
              <h3 className="text-lg apple-font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
                Template Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm apple-font-semibold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editingTemplate?.name || ''}
                    onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="apple-input"
                    placeholder="Enter template name"
                  />
                </div>
                <div>
                  <label className="block text-sm apple-font-semibold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={editingTemplate?.subject || ''}
                    onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, subject: e.target.value } : null)}
                    className="apple-input"
                    placeholder="Enter email subject (use {{variable}} for dynamic content)"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm apple-font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                      Content Type
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit')}
                        className="apple-button-secondary flex items-center space-x-2 px-3 py-1"
                      >
                        {previewMode === 'edit' ? <Eye className="h-4 w-4" /> : <Code className="h-4 w-4" />}
                        <span>{previewMode === 'edit' ? 'Preview' : 'Edit'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex space-x-4 mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={editingTemplate?.type === 'html'}
                        onChange={() => setEditingTemplate(prev => prev ? { ...prev, type: 'html' } : null)}
                        className="text-blue-600"
                      />
                      <span className="apple-font-regular" style={{ color: 'rgb(var(--foreground))' }}>HTML</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={editingTemplate?.type === 'text'}
                        onChange={() => setEditingTemplate(prev => prev ? { ...prev, type: 'text' } : null)}
                        className="text-blue-600"
                      />
                      <span className="apple-font-regular" style={{ color: 'rgb(var(--foreground))' }}>Plain Text</span>
                    </label>
                  </div>
                  {previewMode === 'edit' ? (
                    <textarea
                      value={editingTemplate?.content || ''}
                      onChange={(e) => setEditingTemplate(prev => prev ? { ...prev, content: e.target.value } : null)}
                      className="apple-input h-64 font-mono text-sm"
                      placeholder={editingTemplate?.type === 'html' ? 'Enter HTML content...' : 'Enter plain text content...'}
                    />
                  ) : (
                    <div 
                      className="h-64 p-4 rounded-lg border overflow-auto"
                      style={{ 
                        background: 'rgb(var(--apple-gray-6))',
                        borderColor: 'rgb(var(--apple-gray-4))'
                      }}
                    >
                      {editingTemplate?.type === 'html' ? (
                        <div dangerouslySetInnerHTML={{ __html: renderPreview() }} />
                      ) : (
                        <pre className="whitespace-pre-wrap apple-font-regular" style={{ color: 'rgb(var(--foreground))' }}>
                          {renderPreview()}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Variables Panel */}
          <div className="apple-card p-6">
            <h3 className="text-lg apple-font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
              Template Variables
            </h3>
            <p className="text-sm apple-font-regular mb-4" style={{ color: 'rgb(var(--apple-gray-1))' }}>
              Variables found in your template:
            </p>
            {editingTemplate?.variables && editingTemplate.variables.length > 0 ? (
              <div className="space-y-2">
                {editingTemplate.variables.map((variable, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'rgb(var(--apple-gray-6))' }}
                  >
                    <code className="apple-font-regular text-sm" style={{ color: 'rgb(var(--foreground))' }}>
                      {`{{${variable}}}`}
                    </code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                No variables detected. Use {`{{variable_name}}`} syntax to add dynamic content.
              </p>
            )}
            
            <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgb(var(--apple-blue) / 0.1)' }}>
              <h4 className="apple-font-semibold text-sm mb-2" style={{ color: 'rgb(var(--apple-blue))' }}>
                Variable Usage
              </h4>
              <p className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-blue))' }}>
                Use {`{{variable_name}}`} syntax in your content and subject line. 
                Common variables: first_name, last_name, email, company_name
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 animate-apple-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl apple-font-bold mb-2" style={{ color: 'rgb(var(--foreground))' }}>
            Email Templates
          </h1>
          <p className="apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Create and manage reusable email templates with dynamic variables
          </p>
        </div>
        <button
          onClick={createNewTemplate}
          className="apple-button-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="apple-card apple-interactive">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg apple-font-semibold mb-1" style={{ color: 'rgb(var(--foreground))' }}>
                    {template.name}
                  </h3>
                  <p className="text-sm apple-font-regular mb-2" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    {template.subject}
                  </p>
                  <div className="flex items-center space-x-4 text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                    <span>{template.type.toUpperCase()}</span>
                    <span>{template.variables.length} variables</span>
                    <span>{template.usageCount} uses</span>
                  </div>
                </div>
                <div 
                  className={`px-2 py-1 rounded text-xs apple-font-semibold ${
                    template.type === 'html' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {template.type.toUpperCase()}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs apple-font-regular" style={{ color: 'rgb(var(--apple-gray-1))' }}>
                  Modified: {template.lastModified}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => editTemplate(template)}
                    className="p-2 rounded-lg hover:apple-shadow-sm transition-all duration-200"
                    style={{ backgroundColor: 'rgb(var(--apple-gray-6))' }}
                  >
                    <Edit className="h-4 w-4" style={{ color: 'rgb(var(--apple-gray-1))' }} />
                  </button>
                  <button
                    onClick={() => duplicateTemplate(template)}
                    className="p-2 rounded-lg hover:apple-shadow-sm transition-all duration-200"
                    style={{ backgroundColor: 'rgb(var(--apple-gray-6))' }}
                  >
                    <Copy className="h-4 w-4" style={{ color: 'rgb(var(--apple-gray-1))' }} />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-2 rounded-lg hover:bg-red-100 transition-all duration-200"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: 'rgb(var(--apple-red))' }} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-16">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgb(var(--apple-gray-6))' }}
          >
            <FileText className="h-8 w-8" style={{ color: 'rgb(var(--apple-gray-1))' }} />
          </div>
          <h3 className="text-lg apple-font-medium mb-2" style={{ color: 'rgb(var(--foreground))' }}>
            No templates yet
          </h3>
          <p className="apple-font-regular mb-6" style={{ color: 'rgb(var(--apple-gray-1))' }}>
            Create your first email template to get started
          </p>
          <button
            onClick={createNewTemplate}
            className="apple-button-primary"
          >
            Create Template
          </button>
        </div>
      )}
    </div>
  );
}
