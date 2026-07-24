import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}

const BASE_URL = 'https://flowcircuit.manus.space';
const SITE_NAME = 'The Flow Circuit';
const DEFAULT_IMAGE = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663242884547/FNWsxTgAVMLjFeTN.jpg';
const DEFAULT_DESCRIPTION = 'Discover your natural energy role in 5 minutes. The Flow Circuit maps the invisible architecture of team performance — find out if you\'re the Spark, Amplifier, Filter, Ground, or Conductor.';

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | High-Performance Team Architecture`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}

export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'The Flow Circuit',
    url: BASE_URL,
    logo: DEFAULT_IMAGE,
    description: 'High-performance team architecture platform that maps the invisible energy roles driving innovation.',
    founder: {
      '@type': 'Person',
      name: 'Tony Greenberg',
    },
    sameAs: [
      'https://www.linkedin.com/in/tonygreenberg/',
      'https://tonygreenberg.com',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function WebApplicationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'The Flow Circuit Assessment',
    url: `${BASE_URL}/assessment`,
    description: 'A 12-question forced-rank assessment that reveals your natural energy role on a team. Takes 5 minutes.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Individual energy role assessment',
      'Team energy map visualization',
      '360 peer review system',
      'PDF report generation',
      'Friction cost analysis',
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}

export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the Flow Circuit assessment?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Flow Circuit is a 12-question forced-rank assessment that reveals your natural energy role on a team. Based on decades of research into innovation cycles, it identifies whether you are a Spark (idea generator), Amplifier (momentum builder), Filter (quality controller), Ground (executor), or Conductor (orchestrator).',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does the assessment take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The assessment takes approximately 5 minutes to complete. It consists of 12 forced-rank questions where you order 5 options from most like you to least like you.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the 5 energy roles?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The five energy roles are: Spark (ignites ideas and sees what others cannot), Amplifier (builds momentum and rallies belief), Filter (stress-tests and refines the plan), Ground (executes with precision and delivers), and Conductor (orchestrates the flow between all roles).',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the team mapping work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'When multiple people from the same email domain take the assessment, they are automatically grouped into a team. The system generates a Team Energy Map showing the distribution of roles, identifies missing roles, and highlights friction pairs where energy flow breaks down.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the 360 peer review?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'After completing your assessment, you can generate a 360 review link and share it with 3-5 colleagues. They rank how they perceive your energy role. The gap between your self-assessment and how others see you reveals blind spots and growth edges.',
        },
      },
    ],
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
