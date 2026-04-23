import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  FileText,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { cn } from '@lib/utils';
import { Layout, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, InputField, Badge, SelectField, TextareaField } from '@components';
import { useTokenizationApi } from '@hooks';

const steps = [
  { title: 'Basic Info', description: 'Asset details' },
  { title: 'Valuation', description: 'Value & documents' },
  { title: 'Review', description: 'Verify & submit' },
];

const categories = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'commodity', label: 'Commodity' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'art', label: 'Art' },
  { value: 'other', label: 'Other' },
];

export function AssetSubmit() {
  const [currentStep, setCurrentStep] = useState(0);
  const { mutateAsync: submitAsset, isPending: isSubmitting } = useTokenizationApi().submitAsset;
  const [isComplete, setIsComplete] = useState(false);

  // Form data
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [documentsUrl, setDocumentsUrl] = useState('');

  const canProceed = () => {
    if (currentStep === 0) {
      return name.length > 0 && description.length > 0 && category !== '';
    }
    if (currentStep === 1) {
      return estimatedValue.length > 0 && parseInt(estimatedValue) > 0 && documentsUrl.length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      await submitAsset({
        name,
        description,
        category: category as any,
        valuation_sat: parseInt(estimatedValue),
        documents_url: documentsUrl,
      });
      setIsComplete(true);
    } catch (e) {
      console.error('Submission failed', e);
    }
  };

  if (isComplete) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto pt-12">
          <Card className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-accent-green/10 flex items-center justify-center mx-auto mb-6">
              <Check className="text-accent-green" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Asset Submitted!</h2>
            <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
              Your asset has been submitted and is now being evaluated by our AI system. 
              You'll be notified once the evaluation is complete.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/assets">
                <Button variant="outline">View All Assets</Button>
              </Link>
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link to="/assets">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} className="mb-6">
            Back to Assets
          </Button>
        </Link>

        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                    index <= currentStep
                      ? 'bg-accent-bitcoin text-background'
                      : 'bg-background-elevated text-foreground-secondary border border-border'
                  )}
                >
                  {index < currentStep ? <Check size={18} /> : index + 1}
                </div>
                <span className="text-xs mt-2 font-medium">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-24 h-0.5 mx-4',
                  index < currentStep ? 'bg-accent-bitcoin' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-6">
                <Input
                  label="Asset Name"
                  placeholder="e.g., Downtown Office Building"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <TextareaField
                  label="Description"
                  placeholder="Describe your asset in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-32 resize-none"
                  required
                />

                <SelectField
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  placeholder="Select a category"
                  options={categories}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <InputField
                  label="Estimated Value (sats)"
                  type="number"
                  placeholder="0"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  className="font-mono"
                  rightElement={<span className="text-sm">sats</span>}
                  helperText="Estimated value helps with initial evaluation"
                  required
                />

                <Input
                  label="Supporting Documents URL"
                  placeholder="https://example.com/asset-documents.pdf"
                  value={documentsUrl}
                  onChange={(e) => setDocumentsUrl(e.target.value)}
                  helperText="The current API expects a public document URL instead of direct file upload."
                  required
                />
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-background-elevated">
                  <h4 className="font-medium mb-4">Review Your Submission</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Name</span>
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Category</span>
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Estimated Value</span>
                      <span className="font-mono">{parseInt(estimatedValue).toLocaleString()} sats</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground-secondary">Documents</span>
                      <span className="font-mono text-xs truncate max-w-[220px]">{documentsUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-bitcoin/10 border border-accent-bitcoin/20">
                  <Sparkles className="text-accent-bitcoin shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-sm">AI Evaluation</p>
                    <p className="text-sm text-foreground-secondary">
                      Your asset will be evaluated by our AI system within 2-3 business days. 
                      You'll receive a detailed risk assessment and ROI projection.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-background-elevated">
                  <AlertCircle className="text-foreground-secondary shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-sm">Important Notice</p>
                    <p className="text-sm text-foreground-secondary">
                      By submitting this asset, you confirm that all information provided is accurate 
                      and you have the legal right to tokenize this asset. False information may result 
                      in account suspension.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={currentStep === 0 ? 'w-full' : 'flex-1'}
                  rightIcon={<ArrowRight size={18} />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                  className="flex-1"
                >
                  Submit Asset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
