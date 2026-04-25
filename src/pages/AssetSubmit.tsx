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
import { useNotificationStore } from '@stores';

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
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const canProceed = () => {
    if (currentStep === 0) {
      return name.length > 0 && description.length > 0 && category !== '';
    }
    if (currentStep === 1) {
      return estimatedValue.length > 0 && parseInt(estimatedValue) > 0 && !!documentFile;
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
        document: documentFile as File,
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
              Your tokenization request was sent successfully. Please wait for an admin to approve it; once approved, you can decide when to tokenize the asset.
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Supporting Document (PDF)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      if (file && file.size > 10 * 1024 * 1024) {
                        useNotificationStore.getState().error(
                          'File too large', 
                          'Please upload a PDF smaller than 10MB.'
                        );
                        e.target.value = '';
                        setDocumentFile(null);
                        return;
                      }
                      setDocumentFile(file);
                    }}
                    className="block w-full rounded-md border border-border bg-background-surface px-3 py-2 text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-accent-bitcoin/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-accent-bitcoin"
                    required
                  />
                  <p className="text-xs text-foreground-secondary">
                    Upload the managed PDF that supports the asset review and tokenization process.
                  </p>
                </div>
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
                      <span className="font-mono text-xs truncate max-w-[220px]">{documentFile?.name || 'No file selected'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-bitcoin/10 border border-accent-bitcoin/20">
                  <Sparkles className="text-accent-bitcoin shrink-0 mt-0.5" size={18} />
                  <div>
                    <p className="font-medium text-sm">Admin Approval</p>
                    <p className="text-sm text-foreground-secondary">
                      An admin will review your asset request. Tokenization will only become available after approval.
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
