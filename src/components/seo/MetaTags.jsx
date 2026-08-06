import { Helmet } from 'react-helmet-async';

export default function MetaTags({ 
  title = "Trancoso Resolve - Encontre os Melhores Serviços",
  description = "A forma mais fácil de encontrar e contratar serviços de confiança em Trancoso, Bahia.",
  image = "https://media.base44.com/images/public/68eb21726a9614db4a82ba99/322d721b1_tocaapresenta.jpg",
  url = window.location.href,
  type = "website"
}) {
  const fullTitle = title.includes('Trancoso Resolve') ? title : `${title} - Trancoso Resolve`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@trancosoresolve" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
}