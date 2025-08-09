
import React, { useState } from 'react';
import PageTitle from '../core/PageTitle';
import Icon from '../core/Icon';

interface ResourceLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const resources: ResourceLink[] = [
  { id: 'engc-ceng', title: 'Engineering Council - CEng Registration', url: 'https://www.engc.org.uk/ceng', description: 'Official information on CEng requirements and UK-SPEC.', category: 'Official Guidance' },
  { id: 'ukspec', title: 'UK-SPEC Standard', url: 'https://www.engc.org.uk/ukspec', description: 'The UK Standard for Professional Engineering Competence.', category: 'Official Guidance' },
  { id: 'iet-ceng', title: 'IET - Chartered Engineer', url: 'https://www.theiet.org/career/professional-registration/chartered-engineer/', description: 'Guidance from The Institution of Engineering and Technology.', category: 'PEI Specific' },
  { id: 'imeche-ceng', title: 'IMechE - Chartered Engineer', url: 'https://www.imeche.org/membership-registration/membership-application/chartered-engineer', description: 'Guidance from The Institution of Mechanical Engineers.', category: 'PEI Specific' },
  { id: 'ice-ceng', title: 'ICE - Chartered Engineer', url: 'https://www.ice.org.uk/careers-learning/develop-your-career/become-professionally-qualified/chartered-engineer-ceng/', description: 'Guidance from The Institution of Civil Engineers.', category: 'PEI Specific' },
];

const faqs: FAQItem[] = [
  { id: 'faq1', question: 'What is UK-SPEC?', answer: 'UK-SPEC is the UK Standard for Professional Engineering Competence. It sets out the requirements that an individual must meet to be registered as an Engineering Technician (EngTech), Incorporated Engineer (IEng) or Chartered Engineer (CEng).' },
  { id: 'faq2', question: 'How does this platform help me?', answer: 'This platform assists you in understanding UK-SPEC competencies, mapping your experience, receiving AI-powered feedback on your evidence, and drafting your application. It is an assistive tool, not a replacement for formal assessment or mentorship.' },
  { id: 'faq3', question: 'Is the AI feedback a guarantee of CEng success?', answer: 'No. The AI feedback is indicative and based only on the text you provide. Formal CEng assessment involves holistic human judgment by PEI assessors. This tool cannot replicate that process or guarantee success.' },
  { id: 'faq4', question: 'How much evidence should I provide per competency?', answer: 'Quality over quantity. Provide strong, relevant examples that clearly demonstrate your personal contribution and how you meet the specific requirements of each sub-competency. Typically, 2-3 strong examples per sub-competency are a good starting point, but this varies.' },
  { id: 'faq5', question: 'What is CPD?', answer: 'Continuing Professional Development (CPD) is the systematic maintenance, improvement and broadening of knowledge and skill, and the development of personal qualities necessary for the execution of professional and technical duties throughout an engineer\'s working life.' },
];

const AccordionItem: React.FC<{ item: FAQItem, isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="border-b border-theme-border dark:border-dark-theme-border">
            <h2>
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-5 font-medium text-left text-theme-text-base dark:text-dark-theme-text-base hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover focus:outline-none focus:ring-2 focus:ring-theme-primary/30 dark:focus:ring-dark-theme-primary/30"
                    onClick={onClick}
                    aria-expanded={isOpen}
                >
                    <span>{item.question}</span>
                    <Icon name={isOpen ? "chevronDown" : "chevronRight"} className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </h2>
            {isOpen && (
                <div className="p-5 border-t border-theme-border dark:border-dark-theme-border bg-theme-bg-muted dark:bg-dark-theme-bg-muted">
                    <p className="text-theme-text-muted dark:text-dark-theme-text-muted text-sm">{item.answer}</p>
                </div>
            )}
        </div>
    );
};


const ResourceHubPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle title="Resource & Guidance Hub" subtitle="Access key information, official documents, and FAQs for your CEng application journey." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-5 border-b border-theme-border dark:border-dark-theme-border pb-3">Useful Links</h3>
          <div className="space-y-4">
            {resources.map(resource => (
              <div key={resource.id} className="p-4 border border-theme-border dark:border-dark-theme-border rounded-lg hover:shadow-md transition-shadow bg-theme-bg-muted/50 dark:bg-dark-theme-bg-muted/50">
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-theme-link-text dark:text-dark-theme-link-text hover:underline font-semibold text-lg">
                  {resource.title}
                </a>
                <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted mt-1">{resource.description}</p>
                <span className="mt-2 inline-block bg-theme-primary/20 dark:bg-dark-theme-primary/20 text-theme-primary dark:text-dark-theme-primary text-xs font-medium px-2.5 py-0.5 rounded-full">{resource.category}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-xl">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-5 border-b border-theme-border dark:border-dark-theme-border pb-3">Frequently Asked Questions</h3>
          <div className="divide-y divide-theme-border dark:divide-dark-theme-border">
             {faqs.map(faq => (
                <AccordionItem 
                    key={faq.id} 
                    item={faq}
                    isOpen={openFAQ === faq.id}
                    onClick={() => toggleFAQ(faq.id)}
                />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceHubPage;
