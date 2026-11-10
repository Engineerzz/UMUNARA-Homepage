import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  useBulkCheckPhoneNumbers,
  useCheckPhoneNumber,
  useCreateTransferProvider,
  useGetAdminSummary,
  useListAdminProviders,
  useListAdminReports,
  useListAdminUsers,
  useListRecentReports,
  useListTransferProviders,
  useRequestUploadUrl,
  useSubmitSafetyReport,
  useUpdateReportStatus,
  useUpdateTransferProvider,
  getGetAdminSummaryQueryKey,
  getListAdminProvidersQueryKey,
  getListAdminReportsQueryKey,
  getListAdminUsersQueryKey,
  getListRecentReportsQueryKey,
  getListTransferProvidersQueryKey,
  type AdminReport,
  type ReportCategory,
  type ReportStatus,
  type TransferProvider,
  type TransferProviderInput,
} from '@workspace/api-client-react';
import { useAuth } from '@workspace/replit-auth-web';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight, CircleAlert, FileCheck2, FileImage, Globe2, LockKeyhole,
  Menu, Search, ShieldCheck, Signal, Upload, X,
} from 'lucide-react';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
type Language = 'en' | 'rw' | 'fr';
type CopyKey = keyof typeof copy.en;
const copy = {
  en: {
    made: 'A community safety service for Rwanda', check: 'Check a number', report: 'Report a scam',
    providers: 'Transfer guide', tips: 'Safety tips', how: 'How it works', about: 'About',
    signIn: 'Sign in', signOut: 'Sign out', eyebrow: 'A clearer signal for safer decisions',
    headlineA: 'Pause before', headlineB: 'you send.', hero: 'Check a phone number against approved community reports. Share what happened. Make your next money move with more context.',
    checkTitle: 'Check a phone number', checkLead: 'Search approved reports only. No result means no approved report was found — it does not mean a number is safe.',
    phone: 'Phone number', phonePlaceholder: '+250 7XX XXX XXX', checkNow: 'Check number',
    noResultTitle: 'No check yet', noResultCopy: 'Enter a number to see whether approved community reports are available.',
    reportedTitle: 'Approved reports found', reportedCopy: 'This number has approved community reports. Review the details and use your judgement before responding.',
    clearTitle: 'No approved reports found', clearCopy: 'This number has no approved reports in this service. That is not a safety guarantee.',
    bulkTitle: 'Check several numbers', bulkLead: 'Paste one number per line. Up to 200 numbers can be checked at a time.',
    bulkPlaceholder: '+250 7XX XXX XXX\n+250 7YY YYY YYY', bulkButton: 'Check list', bulkEmpty: 'Your results will appear here.',
    countryTitle: 'Country calling codes', countryLead: 'Look up a calling code by country name or code. Country alone never indicates scam risk.',
    countrySearch: 'Search countries or calling codes', countryLabel: 'International lookup', rwanda: 'Rwanda', rwCode: '+250',
    tipsTitle: 'Small pauses protect your money', tipsLead: 'Practical habits for calls, messages and mobile money.',
    tipOneTitle: 'Verify the person', tipOne: 'Call back using a number you already trust, not a number from an urgent message.',
    tipTwoTitle: 'Keep your PIN private', tipTwo: 'A real provider will never ask you to share your Mobile Money PIN or one-time code.',
    tipThreeTitle: 'Slow down urgency', tipThree: 'Pressure to act immediately is a reason to pause and check independently.',
    tipFourTitle: 'Check the recipient', tipFour: 'Confirm the name and number on the transfer screen before approving.',
    providerTitle: 'Transfer provider directory', providerLead: 'Compare available ways to move money. Fee and speed details remain unverified unless a source is shown.',
    worksWith: 'Works with', momo: 'MoMo', airtel: 'Airtel Money', banks: 'Banks', fee: 'Fees', speed: 'Speed',
    unverified: 'Unverified — no source listed', verified: 'Source provided', noProviders: 'No providers are listed yet.',
    reportTitle: 'Tell us what happened', reportLead: 'Reports are reviewed before they appear in public number checks. Do not include your PIN, password or one-time code.',
    category: 'Report category', chooseCategory: 'Choose a category', description: 'What happened?', descriptionHint: 'Share the message or call details, when it happened, and what they asked you to do. Do not include secret codes.',
    proof: 'Optional image proof', proofHelp: 'Image only. Up to 10 MB. Evidence is private and only accessible to administrators.',
    reporterPhone: 'Your phone number (optional)', submitReport: 'Send report for review', submitted: 'Your report was received and is awaiting review.',
    submitError: 'We could not submit your report. Please try again.', uploadError: 'Image upload failed. You can remove it and submit without proof.',
    recentTitle: 'Recent approved reports', recentLead: 'Approved community reports only. Personal report details and evidence are never displayed here.',
    recentEmpty: 'There are no approved reports to show yet.', reportCount: 'approved reports', latest: 'Latest report',
    aboutTitle: 'A community signal, not a verdict', aboutCopy: 'UMUNARA helps people in Rwanda make better-informed choices when a call or message involves money. Reports are reviewed before they are used in public checks.',
    howTitle: 'How it works', howOne: 'Check a number', howOneCopy: 'Search against reports that moderators have approved.', howTwo: 'Share a report', howTwoCopy: 'Describe what happened. A moderator reviews it before publication.', howThree: 'Choose with care', howThreeCopy: 'A result is context, not a guarantee or a verdict about a person.',
    contact: 'Contact Us', privacy: 'Privacy', footer: 'A locally grounded service for safer telecom and money decisions.',
    loading: 'Loading…', retry: 'Try again', error: 'Something went wrong while loading this information.',
    admin: 'Moderation', adminTitle: 'Safety desk', overview: 'Overview', moderation: 'Reports', users: 'People', manageProviders: 'Providers',
    protected: 'Administrator access required', protectedCopy: 'Sign in with an authorized administrator account to view private moderation and service data.',
    totalReports: 'All reports', pendingReports: 'Awaiting review', approvedReports: 'Approved reports', reportedNumbers: 'Numbers reported', numberChecks: 'Number checks', registeredUsers: 'Registered users',
    status: 'Status', searchReports: 'Search number or report text', allStatuses: 'All statuses', approve: 'Approve', stop: 'Stop', clean: 'Mark cleaned', delete: 'Delete',
    noReports: 'No reports match these filters.', reportDetails: 'Report details', reporter: 'Reporter', evidence: 'Private evidence', noEvidence: 'No image evidence attached.',
    providerAdd: 'Add provider', providerEdit: 'Edit', providerName: 'Provider name', logoText: 'Short label', sourceUrl: 'Source URL', feeInfo: 'Fee information', speedInfo: 'Speed information', published: 'Published', save: 'Save provider', cancel: 'Cancel', noUsers: 'No registered users to display.',
    worksMomo: 'Works with MoMo', worksAirtel: 'Works with Airtel Money', worksBanks: 'Works with banks', source: 'Source', verifiedOn: 'Verified on',
    lookup: 'Find a calling code', startCheck: 'Start a number check', removeFile: 'Remove image', count: 'Reports', actions: 'Actions', email: 'Email', created: 'Created', communitySignal: 'COMMUNITY SIGNAL', reviewDesk: 'UMUNARA REVIEW', maxBulk: 'Maximum 200 numbers per check.', addNumbers: 'Add at least one phone number.', privacyCopy: 'When you submit a report, the number and description may be shown in public only after moderator approval. Optional reporter contact and image proof are not shown on public report listings.', contactCopy: 'UMUNARA is a locally grounded community service. Contact details were not provided for this interface.',
  },
  rw: {
    made: 'Serivisi y’umutekano w’abaturage mu Rwanda', check: 'Genzura nimero', report: 'Tanga raporo y’uburiganya',
    providers: 'Amakuru yo kohereza amafaranga', tips: 'Inama z’umutekano', how: 'Uko bikora', about: 'Ibyerekeye',
    signIn: 'Injira', signOut: 'Sohoka', eyebrow: 'Amakuru afasha gufata icyemezo kirushijeho kuba cyiza',
    headlineA: 'Banza utekereze', headlineB: 'mbere yo kohereza.', hero: 'Genzura nimero ya telefoni urebe raporo zemejwe n’abaturage. Sangiza abandi ibyabaye. Fata icyemezo ufite amakuru ahagije.',
    checkTitle: 'Genzura nimero ya telefoni', checkLead: 'Shakisha raporo zemejwe gusa. Iyo nta raporo ibonetse, ntibivuze ko nimero ifite umutekano.',
    phone: 'Nimero ya telefoni', phonePlaceholder: '+250 7XX XXX XXX', checkNow: 'Genzura nimero',
    noResultTitle: 'Nta genzura rirakorwa', noResultCopy: 'Andika nimero urebe niba hari raporo zemejwe.',
    reportedTitle: 'Habonetse raporo zemejwe', reportedCopy: 'Iyi nimero ifite raporo zemejwe. Suzuma amakuru, utekereze mbere yo gusubiza.',
    clearTitle: 'Nta raporo yemejwe', clearCopy: 'Nta raporo yemejwe kuri iyi nimero muri iyi serivisi. Ibi ntibihamya ko ifite umutekano.',
    bulkTitle: 'Genzura nimero nyinshi', bulkLead: 'Andika nimero imwe kuri buri murongo. Ushobora kugenzura nimero zigera kuri 200.',
    bulkPlaceholder: '+250 7XX XXX XXX\n+250 7YY YYY YYY', bulkButton: 'Genzura urutonde', bulkEmpty: 'Ibisubizo bizagaragara hano.',
    countryTitle: 'Kode mpuzamahanga zo guhamagara', countryLead: 'Shaka kode ukoresheje izina ry’igihugu cyangwa kode. Igihugu cyonyine ntikigaragaza ibyago by’uburiganya.',
    countrySearch: 'Shaka igihugu cyangwa kode', countryLabel: 'Kode mpuzamahanga', rwanda: 'Rwanda', rwCode: '+250',
    tipsTitle: 'Kuruhuka gato birinda amafaranga yawe', tipsLead: 'Ingeso zifasha mu guhamagara, ubutumwa na Mobile Money.',
    tipOneTitle: 'Emeza uwo muvugana', tipOne: 'Hamagara ukoresheje nimero usanzwe wizera, aho gukoresha iyo bohereje mu butumwa bwihutirwa.',
    tipTwoTitle: 'Bika PIN yawe', tipTwo: 'Umuyobozi w’ukuri ntazagusaba PIN ya Mobile Money cyangwa kode y’igihe gito.',
    tipThreeTitle: 'Ntukihutishe icyemezo', tipThree: 'Iyo bagusaba gukora ako kanya, banza uhagarare ugenzure amakuru ahandi.',
    tipFourTitle: 'Genzura ugiye guha amafaranga', tipFour: 'Emeza izina na nimero bigaragara kuri ecran mbere yo kwemeza kohereza.',
    providerTitle: 'Abatanga serivisi zo kohereza amafaranga', providerLead: 'Reba uburyo bwo kohereza amafaranga. Amafaranga n’igihe ntibyemejwe keretse hari isoko ry’amakuru.',
    worksWith: 'Ikorana na', momo: 'MoMo', airtel: 'Airtel Money', banks: 'Amabanki', fee: 'Amafaranga asabwa', speed: 'Umuvuduko',
    unverified: 'Ntibyemejwe — nta soko ry’amakuru', verified: 'Hari isoko ry’amakuru', noProviders: 'Nta batanga serivisi barashyirwa hano.',
    reportTitle: 'Tubwire ibyabaye', reportLead: 'Raporo zirasuzumwa mbere yo kugaragara mu igenzura rusange. Ntushyiremo PIN, ijambo ry’ibanga cyangwa kode y’igihe gito.',
    category: 'Icyiciro cya raporo', chooseCategory: 'Hitamo icyiciro', description: 'Byagenze bite?', descriptionHint: 'Vuga iby’ubutumwa cyangwa umuhamagaro, igihe byabereye n’icyo bagusabye. Ntushyiremo kode z’ibanga.',
    proof: 'Ifoto y’inyongera (si ngombwa)', proofHelp: 'Amafoto gusa, atarengeje 10 MB. Ifoto ibikwa mu ibanga, abagenzuzi ni bo bonyine bayigeraho.',
    reporterPhone: 'Nimero yawe (si ngombwa)', submitReport: 'Ohereza raporo isuzumwe', submitted: 'Raporo yawe yakiriwe kandi itegereje isuzumwa.',
    submitError: 'Ntitwashoboye kohereza raporo. Ongera ugerageze.', uploadError: 'Ifoto ntiyoherejwe. Uyikuremo wohereze raporo itayifite.',
    recentTitle: 'Raporo ziheruka kwemezwa', recentLead: 'Raporo zemejwe gusa. Ibisobanuro bwite n’amafoto ntibigaragazwa hano.',
    recentEmpty: 'Nta raporo zemejwe ziraboneka.', reportCount: 'raporo zemejwe', latest: 'Raporo iheruka',
    aboutTitle: 'Amakuru y’abaturage, si urubanza', aboutCopy: 'UMUNARA ifasha abantu mu Rwanda gufata ibyemezo bishingiye ku makuru iyo telefoni cyangwa ubutumwa bireba amafaranga. Raporo zirasuzumwa mbere yo gukoreshwa.',
    howTitle: 'Uko bikora', howOne: 'Genzura nimero', howOneCopy: 'Shakisha raporo zemejwe n’abagenzuzi.', howTwo: 'Tanga raporo', howTwoCopy: 'Sobanura ibyabaye. Umugenzuzi arayisuzuma mbere yo kuyitangaza.', howThree: 'Fata icyemezo witonze', howThreeCopy: 'Ibisubizo bitanga amakuru, si isezerano cyangwa urubanza ku muntu.',
    contact: 'Twandikire', privacy: 'Ibanga', footer: 'Serivisi ishingiye ku Rwanda ifasha gufata ibyemezo byizewe kuri telefoni n’amafaranga.',
    loading: 'Birimo gutegurwa…', retry: 'Ongera ugerageze', error: 'Habaye ikibazo mu kubona aya makuru.',
    admin: 'Ubugenzuzi', adminTitle: 'Ikigo cy’umutekano', overview: 'Incamake', moderation: 'Raporo', users: 'Abakoresha', manageProviders: 'Abatanga serivisi',
    protected: 'Abayobozi bonyine bemerewe', protectedCopy: 'Injira ukoresheje konti y’umuyobozi wemewe kugira ngo ubone raporo n’amakuru bwite.',
    totalReports: 'Raporo zose', pendingReports: 'Zitegereje kugenzurwa', approvedReports: 'Raporo zemejwe', reportedNumbers: 'Nimero zatangiwe raporo', numberChecks: 'Igenzura rya nimero', registeredUsers: 'Abakoresha biyandikishije',
    status: 'Imiterere', searchReports: 'Shaka nimero cyangwa raporo', allStatuses: 'Imiterere yose', approve: 'Emeza', stop: 'Hagarika', clean: 'Shyira ko byakemutse', delete: 'Siba',
    noReports: 'Nta raporo zihuye n’ibi byatoranyijwe.', reportDetails: 'Ibisobanuro bya raporo', reporter: 'Uwatanze raporo', evidence: 'Ifoto y’ibanga', noEvidence: 'Nta foto yatanzwe.',
    providerAdd: 'Ongeraho serivisi', providerEdit: 'Hindura', providerName: 'Izina rya serivisi', logoText: 'Izina rigufi', sourceUrl: 'Urubuga rw’isoko', feeInfo: 'Amakuru y’amafaranga', speedInfo: 'Amakuru y’igihe', published: 'Yashyizwe ahagaragara', save: 'Bika serivisi', cancel: 'Hagarika', noUsers: 'Nta bakoresha biyandikishije bagaragazwa.',
    worksMomo: 'Ikorana na MoMo', worksAirtel: 'Ikorana na Airtel Money', worksBanks: 'Ikorana n’amabanki', source: 'Isoko', verifiedOn: 'Yemejwe ku wa',
    lookup: 'Shaka kode yo guhamagara', startCheck: 'Tangira igenzura', removeFile: 'Kuramo ifoto', count: 'Raporo', actions: 'Ibikorwa', email: 'Imeyili', created: 'Yaremwe', communitySignal: 'AMAKURU Y’ABATURAGE', reviewDesk: 'UMUNARA ISUZUMA', maxBulk: 'Nturenze nimero 200 mu igenzura rimwe.', addNumbers: 'Ongeramo nibura nimero imwe ya telefoni.', privacyCopy: 'Iyo utanze raporo, nimero n’ibisobanuro bishobora kugaragara ku mugaragaro ari uko byemejwe n’umugenzuzi. Nimero y’uwatanze raporo n’ifoto ntibigaragazwa ku rutonde rusange.', contactCopy: 'UMUNARA ni serivisi y’abaturage ishingiye ku Rwanda. Nta makuru y’aho twaboneka yatanzwe kuri iyi porogaramu.',
  },
  fr: {
    made: 'Un service de sécurité communautaire pour le Rwanda', check: 'Vérifier un numéro', report: 'Signaler une arnaque',
    providers: 'Guide des transferts', tips: 'Conseils de sécurité', how: 'Comment ça marche', about: 'À propos',
    signIn: 'Se connecter', signOut: 'Se déconnecter', eyebrow: 'Des informations claires pour mieux décider',
    headlineA: 'Prenez le temps', headlineB: 'avant d’envoyer.', hero: 'Vérifiez un numéro à partir des signalements communautaires approuvés. Racontez ce qui s’est passé. Décidez avec davantage de contexte.',
    checkTitle: 'Vérifier un numéro de téléphone', checkLead: 'Seuls les signalements approuvés sont recherchés. Aucun résultat ne signifie pas qu’un numéro est sûr.',
    phone: 'Numéro de téléphone', phonePlaceholder: '+250 7XX XXX XXX', checkNow: 'Vérifier le numéro',
    noResultTitle: 'Aucune vérification', noResultCopy: 'Saisissez un numéro pour voir si des signalements approuvés existent.',
    reportedTitle: 'Signalements approuvés trouvés', reportedCopy: 'Ce numéro fait l’objet de signalements approuvés. Examinez les détails et décidez avec prudence.',
    clearTitle: 'Aucun signalement approuvé', clearCopy: 'Aucun signalement approuvé n’a été trouvé pour ce numéro. Cela ne garantit pas sa sécurité.',
    bulkTitle: 'Vérifier plusieurs numéros', bulkLead: 'Collez un numéro par ligne. Jusqu’à 200 numéros peuvent être vérifiés à la fois.',
    bulkPlaceholder: '+250 7XX XXX XXX\n+250 7YY YYY YYY', bulkButton: 'Vérifier la liste', bulkEmpty: 'Les résultats apparaîtront ici.',
    countryTitle: 'Indicatifs téléphoniques internationaux', countryLead: 'Recherchez un indicatif par pays ou par code. Le pays seul n’indique aucun risque d’arnaque.',
    countrySearch: 'Rechercher un pays ou un indicatif', countryLabel: 'Recherche internationale', rwanda: 'Rwanda', rwCode: '+250',
    tipsTitle: 'Une pause protège votre argent', tipsLead: 'Des habitudes utiles pour les appels, les messages et le Mobile Money.',
    tipOneTitle: 'Vérifiez votre interlocuteur', tipOne: 'Rappelez un numéro de confiance connu, pas celui d’un message urgent.',
    tipTwoTitle: 'Gardez votre code PIN privé', tipTwo: 'Un vrai fournisseur ne vous demandera jamais votre code PIN Mobile Money ni un code à usage unique.',
    tipThreeTitle: 'Méfiez-vous de l’urgence', tipThree: 'Une pression pour agir immédiatement est une raison de faire une pause et de vérifier.',
    tipFourTitle: 'Vérifiez le destinataire', tipFour: 'Confirmez le nom et le numéro affichés avant de valider le transfert.',
    providerTitle: 'Répertoire des fournisseurs de transfert', providerLead: 'Comparez les moyens disponibles. Les frais et délais restent non vérifiés sans source indiquée.',
    worksWith: 'Compatible avec', momo: 'MoMo', airtel: 'Airtel Money', banks: 'Banques', fee: 'Frais', speed: 'Délai',
    unverified: 'Non vérifié — aucune source indiquée', verified: 'Source fournie', noProviders: 'Aucun fournisseur répertorié pour le moment.',
    reportTitle: 'Racontez-nous ce qui s’est passé', reportLead: 'Les signalements sont examinés avant d’apparaître dans les recherches publiques. N’indiquez jamais votre code PIN, mot de passe ou code temporaire.',
    category: 'Catégorie', chooseCategory: 'Choisir une catégorie', description: 'Que s’est-il passé ?', descriptionHint: 'Décrivez le message ou l’appel, sa date et ce qui vous a été demandé. N’incluez aucun code secret.',
    proof: 'Image justificative facultative', proofHelp: 'Image uniquement, jusqu’à 10 Mo. Les preuves sont privées et accessibles uniquement aux administrateurs.',
    reporterPhone: 'Votre téléphone (facultatif)', submitReport: 'Envoyer pour examen', submitted: 'Votre signalement a été reçu et attend son examen.',
    submitError: 'Impossible d’envoyer votre signalement. Veuillez réessayer.', uploadError: 'Échec du chargement. Retirez l’image ou réessayez.',
    recentTitle: 'Signalements approuvés récents', recentLead: 'Signalements communautaires approuvés uniquement. Les informations privées et les preuves ne sont jamais affichées ici.',
    recentEmpty: 'Aucun signalement approuvé à afficher pour le moment.', reportCount: 'signalements approuvés', latest: 'Dernier signalement',
    aboutTitle: 'Un signal communautaire, pas un verdict', aboutCopy: 'UMUNARA aide les habitants du Rwanda à prendre des décisions mieux informées lorsqu’un appel ou un message concerne de l’argent. Les signalements sont examinés avant utilisation.',
    howTitle: 'Comment ça marche', howOne: 'Vérifiez un numéro', howOneCopy: 'Recherchez les signalements approuvés par les modérateurs.', howTwo: 'Partagez un signalement', howTwoCopy: 'Décrivez les faits. Un modérateur l’examine avant publication.', howThree: 'Décidez avec prudence', howThreeCopy: 'Un résultat fournit du contexte, pas une garantie ni un verdict sur une personne.',
    contact: 'Nous contacter', privacy: 'Confidentialité', footer: 'Un service local pour des décisions plus sûres concernant les télécoms et l’argent.',
    loading: 'Chargement…', retry: 'Réessayer', error: 'Une erreur est survenue lors du chargement.',
    admin: 'Modération', adminTitle: 'Espace sécurité', overview: 'Vue d’ensemble', moderation: 'Signalements', users: 'Personnes', manageProviders: 'Fournisseurs',
    protected: 'Accès administrateur requis', protectedCopy: 'Connectez-vous avec un compte administrateur autorisé pour consulter les données privées.',
    totalReports: 'Tous les signalements', pendingReports: 'En attente', approvedReports: 'Approuvés', reportedNumbers: 'Numéros signalés', numberChecks: 'Vérifications', registeredUsers: 'Utilisateurs inscrits',
    status: 'Statut', searchReports: 'Rechercher un numéro ou un texte', allStatuses: 'Tous les statuts', approve: 'Approuver', stop: 'Arrêter', clean: 'Marquer résolu', delete: 'Supprimer',
    noReports: 'Aucun signalement ne correspond aux filtres.', reportDetails: 'Détails du signalement', reporter: 'Auteur', evidence: 'Preuve privée', noEvidence: 'Aucune image jointe.',
    providerAdd: 'Ajouter un fournisseur', providerEdit: 'Modifier', providerName: 'Nom du fournisseur', logoText: 'Libellé court', sourceUrl: 'URL de la source', feeInfo: 'Informations sur les frais', speedInfo: 'Informations sur le délai', published: 'Publié', save: 'Enregistrer', cancel: 'Annuler', noUsers: 'Aucun utilisateur inscrit à afficher.',
    worksMomo: 'Compatible avec MoMo', worksAirtel: 'Compatible avec Airtel Money', worksBanks: 'Compatible avec les banques', source: 'Source', verifiedOn: 'Vérifié le',
    lookup: 'Trouver un indicatif', startCheck: 'Vérifier un numéro', removeFile: 'Retirer l’image', count: 'Signalements', actions: 'Actions', email: 'E-mail', created: 'Créé', communitySignal: 'SIGNALEMENT COMMUNAUTAIRE', reviewDesk: 'EXAMEN UMUNARA', maxBulk: 'Maximum 200 numéros par vérification.', addNumbers: 'Ajoutez au moins un numéro de téléphone.', privacyCopy: 'Lorsqu’un signalement est envoyé, le numéro et la description peuvent être affichés publiquement après approbation d’un modérateur. Les coordonnées facultatives et les preuves ne figurent pas sur les listes publiques.', contactCopy: 'UMUNARA est un service communautaire ancré au Rwanda. Aucune coordonnée de contact n’a été fournie pour cette interface.',
  },
} as const;

const countries = [
  { name: 'Rwanda', rw: 'u Rwanda', fr: 'Rwanda', code: '+250', variant: 'rw' }, { name: 'Burundi', rw: 'u Burundi', fr: 'Burundi', code: '+257', variant: 'bi' },
  { name: 'Uganda', rw: 'Uganda', fr: 'Ouganda', code: '+256', variant: 'ug' }, { name: 'Kenya', rw: 'Kenya', fr: 'Kenya', code: '+254', variant: 'ke' },
  { name: 'Tanzania', rw: 'Tanzaniya', fr: 'Tanzanie', code: '+255', variant: 'tz' }, { name: 'Democratic Republic of the Congo', rw: 'Repubulika Iharanira Demokarasi ya Kongo', fr: 'République démocratique du Congo', code: '+243', variant: 'cd' },
  { name: 'France', rw: 'Ubufaransa', fr: 'France', code: '+33', variant: 'fr' }, { name: 'Belgium', rw: 'Ububiligi', fr: 'Belgique', code: '+32', variant: 'be' },
  { name: 'United Kingdom', rw: 'Ubwongereza', fr: 'Royaume-Uni', code: '+44', variant: 'gb' }, { name: 'United States', rw: 'Leta Zunze Ubumwe za Amerika', fr: 'États-Unis', code: '+1', variant: 'us' },
  { name: 'Canada', rw: 'Kanada', fr: 'Canada', code: '+1', variant: 'ca' }, { name: 'United Arab Emirates', rw: 'Leta Zunze Ubumwe z’Abarabu', fr: 'Émirats arabes unis', code: '+971', variant: 'ae' },
  { name: 'South Africa', rw: 'Afurika y’Epfo', fr: 'Afrique du Sud', code: '+27', variant: 'za' }, { name: 'Nigeria', rw: 'Nijeriya', fr: 'Nigéria', code: '+234', variant: 'ng' },
  { name: 'India', rw: 'Ubuhinde', fr: 'Inde', code: '+91', variant: 'in' }, { name: 'China', rw: 'Ubushinwa', fr: 'Chine', code: '+86', variant: 'cn' },
];
const categoryLabels: Record<ReportCategory, Record<Language, string>> = {
  momo_scam: { en: 'MoMo scam', rw: 'Uburiganya bwa MoMo', fr: 'Arnaque MoMo' },
  airtel_money_scam: { en: 'Airtel Money scam', rw: 'Uburiganya bwa Airtel Money', fr: 'Arnaque Airtel Money' },
  bank_scam: { en: 'Bank scam', rw: 'Uburiganya bwa banki', fr: 'Arnaque bancaire' },
  fake_job: { en: 'Fake job offer', rw: 'Akazi k’ibinyoma', fr: 'Fausse offre d’emploi' },
  fake_lottery: { en: 'Fake lottery or prize', rw: 'Ibihembo by’ibinyoma', fr: 'Fausse loterie ou récompense' },
  other: { en: 'Other', rw: 'Ikindi', fr: 'Autre' },
};
const categories = Object.keys(categoryLabels) as ReportCategory[];
const statusLabels: Record<string, Record<Language, string>> = {
  pending: { en: 'Pending', rw: 'Itegereje', fr: 'En attente' },
  approved: { en: 'Approved', rw: 'Yemejwe', fr: 'Approuvé' },
  stopped: { en: 'Stopped', rw: 'Yahagaritswe', fr: 'Arrêté' },
  cleaned: { en: 'Cleaned', rw: 'Byakemutse', fr: 'Résolu' },
  deleted: { en: 'Deleted', rw: 'Yasibwe', fr: 'Supprimé' },
};
const callCodes: Array<{ value: ReportStatus; label: string }> = [
  { value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'stopped', label: 'Stopped' }, { value: 'cleaned', label: 'Cleaned' }, { value: 'deleted', label: 'Deleted' },
];

function AppShell() {
  const [language, setLanguage] = useState<Language>('en');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [path] = useLocation();
  const auth = useAuth();
  const t = (key: CopyKey) => copy[language][key];
  if (path === '/admin') return <Admin language={language} t={t} auth={auth} />;
  return <Home language={language} setLanguage={setLanguage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} t={t} auth={auth} />;
}

type Translator = (key: CopyKey) => string;
type AuthState = ReturnType<typeof useAuth>;

function Brand() {
  return <a className="u-brand" href="/" data-testid="link-home"><span className="u-mark" aria-hidden="true"><i /><i /><i /></span><span className="u-word">UMUNARA<em>.</em><small>RWANDA, TOGETHER</small></span></a>;
}

function Home({ language, setLanguage, mobileOpen, setMobileOpen, t, auth }: { language: Language; setLanguage: (v: Language) => void; mobileOpen: boolean; setMobileOpen: (v: boolean) => void; t: Translator; auth: AuthState }) {
  const [phone, setPhone] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [countryQuery, setCountryQuery] = useState('');
  const [reportPhone, setReportPhone] = useState('');
  const [reportCategory, setReportCategory] = useState<ReportCategory | ''>('');
  const [description, setDescription] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [bulkNotice, setBulkNotice] = useState('');
  const checkMutation = useCheckPhoneNumber();
  const bulkMutation = useBulkCheckPhoneNumbers();
  const submitMutation = useSubmitSafetyReport();
  const uploadMutation = useRequestUploadUrl();
  const recent = useListRecentReports({ limit: 8 });
  const providers = useListTransferProviders();
  const shownCountries = useMemo(() => countries.filter((item) => `${item.name} ${item.rw} ${item.fr} ${item.code}`.toLowerCase().includes(countryQuery.toLowerCase())), [countryQuery]);
  const go = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const checkOne = (event: FormEvent) => {
    event.preventDefault();
    const value = phone.trim();
    if (value.length < 6) return;
    checkMutation.mutate({ data: { phoneNumber: value } });
  };
  const checkBulk = (event: FormEvent) => {
    event.preventDefault();
    const numbers = bulkText.split(/[\n,;\t ]+/).map((v) => v.trim()).filter(Boolean);
    if (!numbers.length || numbers.length > 200) {
      setBulkNotice(numbers.length > 200 ? t('maxBulk') : t('addNumbers'));
      return;
    }
    setBulkNotice('');
    bulkMutation.mutate({ data: { phoneNumbers: numbers } });
  };
  const uploadProof = async () => {
    if (!proof) return undefined;
    const contentType = proof.type as 'image/jpeg' | 'image/png' | 'image/webp';
    const result = await uploadMutation.mutateAsync({ data: { name: proof.name, size: proof.size, contentType } });
    const upload = await fetch(result.uploadURL, { method: 'PUT', headers: { 'Content-Type': proof.type }, body: proof });
    if (!upload.ok) throw new Error('upload failed');
    return result.objectPath;
  };
  const submitReport = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(false);
    setFormMessage('');
    if (!reportCategory || reportPhone.trim().length < 6 || description.trim().length < 10) return;
    try {
      const evidenceObjectPath = await uploadProof();
      await submitMutation.mutateAsync({ data: { phoneNumber: reportPhone.trim(), category: reportCategory, description: description.trim(), evidenceObjectPath, reporterPhone: reporterPhone.trim() || undefined } });
      setFormMessage(t('submitted'));
      setReportPhone(''); setReportCategory(''); setDescription(''); setReporterPhone(''); setProof(null);
      await queryClient.invalidateQueries({ queryKey: getListRecentReportsQueryKey({ limit: 8 }) });
    } catch {
      setFormError(true);
      setFormMessage(proof ? t('uploadError') : t('submitError'));
    }
  };
  const navItems = [
    ['check', 'check'], ['report', 'report'], ['providers', 'providers'], ['tips', 'tips'], ['how', 'how'],
  ] as const;
  return <main className="umunara">
    <div className="u-topline">{t('made')}</div>
    <header className="u-header">
      <div className="u-container u-nav">
        <Brand />
        <nav className="u-navlinks" aria-label="Main navigation">{navItems.map(([label, id]) => <button key={id} onClick={() => go(id)} data-testid={`nav-${id}`}>{t(label)}</button>)}</nav>
        <select className="u-lang" aria-label="Choose language" value={language} onChange={(e) => setLanguage(e.target.value as Language)} data-testid="select-language"><option value="en">EN</option><option value="rw">RW</option><option value="fr">FR</option></select>
        {auth.isLoading ? <span className="u-auth" aria-label={t('loading')}>{t('loading')}</span> : auth.isAuthenticated
          ? <button className="u-auth" onClick={auth.logout} data-testid="button-sign-out">{t('signOut')}</button>
          : <button className="u-auth" onClick={auth.login} data-testid="button-sign-in">{t('signIn')}</button>}
        <button className="u-mobile-nav-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} data-testid="button-mobile-menu">{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      <nav className={`u-mobile-menu ${mobileOpen ? 'open' : ''}`} aria-label="Mobile navigation">{navItems.map(([label, id]) => <button key={id} onClick={() => go(id)} data-testid={`mobile-nav-${id}`}>{t(label)}<ArrowRight size={14} /></button>)}<button onClick={() => go('about')}>{t('about')}</button></nav>
    </header>
    <section className="u-hero">
      <div className="u-container u-hero-grid">
        <div><div className="u-eyebrow light">{t('eyebrow')}</div><h1>{t('headlineA')}<br /><em>{t('headlineB')}</em></h1><p className="u-hero-copy">{t('hero')}</p><button className="u-btn gold" onClick={() => go('check')} data-testid="button-start-check">{t('startCheck')}<ArrowRight size={15} /></button></div>
        <div className="u-hero-side" aria-hidden="true"><div className="u-orbit" /><div className="u-seal"><ShieldCheck size={28} color="#dfbf5b" /><strong>UMUNARA</strong><span>{t('communitySignal')}</span></div></div>
      </div>
    </section>
    <div className="u-ticker" aria-label="Safety reminders"><div className="u-ticker-track">{[0, 1].map((copyIndex) => <span key={copyIndex}>{[t('tipOne'), t('tipTwo'), t('tipThree'), t('tipFour')].map((tip, i) => <span key={i}>{tip}</span>)}</span>)}</div></div>

    <section className="u-section u-container" id="check" data-testid="section-number-check">
      <div className="u-section-head"><div><div className="u-eyebrow">{t('check')}</div><h2 className="u-section-title">{t('checkTitle')}</h2></div><p className="u-lead">{t('checkLead')}</p></div>
      <div className="u-check-grid">
        <div className="u-check-box">
          <form onSubmit={checkOne}>
            <label className="u-label" htmlFor="phone-check">{t('phone')}</label>
            <div className="u-form-row"><input className="u-input" id="phone-check" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} minLength={6} maxLength={32} required data-testid="input-phone-check" /><button className="u-btn" type="submit" disabled={checkMutation.isPending} data-testid="button-check-number"><Search size={16} />{checkMutation.isPending ? t('loading') : t('checkNow')}</button></div>
          </form>
          <p className="u-form-help">{t('checkLead')}</p>
          <div style={{ marginTop: 24, borderTop: '1px solid #ddd8ca', paddingTop: 19 }}>
            <strong style={{ font: "700 14px 'Manrope', sans-serif" }}>{t('bulkTitle')}</strong><p className="u-form-help">{t('bulkLead')}</p>
            <form onSubmit={checkBulk}><textarea className="u-textarea" style={{ minHeight: 93, marginTop: 10 }} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={t('bulkPlaceholder')} data-testid="textarea-bulk-numbers" /><div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 9 }}><button className="u-btn ghost" type="submit" disabled={bulkMutation.isPending} data-testid="button-bulk-check">{bulkMutation.isPending ? t('loading') : t('bulkButton')}</button>{bulkNotice && <span role="status" className="u-form-help" data-testid="status-bulk">{bulkNotice}</span>}</div></form>
          </div>
        </div>
        <div>
          {checkMutation.isPending ? <div className="u-result"><div className="u-skeleton" /><div className="u-skeleton" /></div>
            : checkMutation.isError ? <InlineError text={t('error')} retry={() => phone.trim() && checkMutation.mutate({ data: { phoneNumber: phone.trim() } })} retryText={t('retry')} />
              : checkMutation.data ? <div className={`u-result ${checkMutation.data.classification === 'reported_scam' ? 'reported' : 'neutral'}`} data-testid="status-phone-check"><span className="u-result-icon">{checkMutation.data.classification === 'reported_scam' ? <CircleAlert size={19} /> : <ShieldCheck size={19} />}</span><div className="u-eyebrow">{checkMutation.data.phoneNumber}</div><h3>{checkMutation.data.classification === 'reported_scam' ? t('reportedTitle') : t('clearTitle')}</h3><p>{checkMutation.data.explanation || (checkMutation.data.classification === 'reported_scam' ? t('reportedCopy') : t('clearCopy'))}</p><div className="u-results"><div className="u-result-line"><span>{t('count')}</span><strong>{checkMutation.data.reportCount}</strong></div><div className="u-result-line"><span>{t('category')}</span><strong>{checkMutation.data.categories.map((c) => categoryLabels[c][language]).join(', ') || '—'}</strong></div></div></div>
                : <div className="u-result" data-testid="empty-phone-check"><span className="u-result-icon"><Signal size={18} /></span><h3>{t('noResultTitle')}</h3><p>{t('noResultCopy')}</p></div>}
          <div style={{ marginTop: 10 }}>
            {bulkMutation.isPending ? <div className="u-skeleton" /> : bulkMutation.isError ? <InlineError text={t('error')} retry={() => { const nums = bulkText.split(/[\n,;\t ]+/).map((v) => v.trim()).filter(Boolean); bulkMutation.mutate({ data: { phoneNumbers: nums } }); }} retryText={t('retry')} /> : bulkMutation.data ? <div className="u-panel" data-testid="results-bulk-check"><div className="u-eyebrow">{t('bulkTitle')}</div>{bulkMutation.data.results.map((item, i) => <div className="u-result-line" key={`${item.phoneNumber}-${i}`}><span>{item.phoneNumber}</span><strong>{item.classification === 'reported_scam' ? `${item.reportCount} ${t('count').toLowerCase()}` : t('clearTitle')}</strong></div>)}</div> : <div className="u-panel" style={{ color: '#748077', fontSize: 11 }} data-testid="empty-bulk-check">{t('bulkEmpty')}</div>}
          </div>
        </div>
      </div>
    </section>

    <section className="u-section alt" id="country-codes" data-testid="section-country-codes"><div className="u-container">
      <div className="u-section-head"><div><div className="u-eyebrow"><Globe2 size={14} />{t('lookup')}</div><h2 className="u-section-title">{t('countryTitle')}</h2></div><p className="u-lead">{t('countryLead')}</p></div>
      <div className="u-country-layout">
        <div className="u-country-card"><div className="u-country-flag rw" aria-label="Rwanda flag illustration" role="img" /><div><div className="u-eyebrow">{t('countryLabel')}</div><h3 style={{ margin: '7px 0 4px', font: "700 19px 'Manrope',sans-serif" }}>{t('rwanda')}</h3><strong style={{ color: '#9a7a2a' }}>{t('rwCode')}</strong></div></div>
        <div><div className="u-country-search"><input className="u-input" placeholder={t('countrySearch')} value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} aria-label={t('countrySearch')} data-testid="input-country-search" /><Search size={18} color="#708078" style={{ alignSelf: 'center' }} /></div><div className="u-country-list" data-testid="list-country-codes">{shownCountries.map((item) => <button className="u-country-item" key={item.code + item.name} onClick={() => { setPhone(item.code + ' '); setCountryQuery(''); go('check'); }} data-testid={`country-code-${item.variant}`}><span className={`u-country-mini flag-${item.variant}`} aria-hidden="true" />{item[language === 'en' ? 'name' : language]}<b>{item.code}</b></button>)}{shownCountries.length === 0 && <p className="u-form-help">{t('noResultCopy')}</p>}</div></div>
      </div>
    </div></section>

    <section className="u-section u-container" id="providers" data-testid="section-providers">
      <div className="u-section-head"><div><div className="u-eyebrow">{t('providers')}</div><h2 className="u-section-title">{t('providerTitle')}</h2></div><p className="u-lead">{t('providerLead')}</p></div>
      {providers.isLoading ? <div className="u-panel"><div className="u-skeleton" /><div className="u-skeleton" /></div> : providers.isError ? <InlineError text={t('error')} retry={() => providers.refetch()} retryText={t('retry')} /> : !providers.data?.length ? <div className="u-empty" data-testid="empty-providers">{t('noProviders')}</div> : <div className="u-provider-list" data-testid="list-providers">{providers.data.filter((p) => p.published).map((p) => <ProviderRow key={p.id} provider={p} t={t} />)}</div>}
    </section>

    <section className="u-section alt" id="tips" data-testid="section-safety-tips"><div className="u-container u-tip-grid">
      <div><div className="u-eyebrow">{t('tips')}</div><h2 className="u-section-title">{t('tipsTitle')}</h2><p className="u-lead" style={{ marginTop: 16 }}>{t('tipsLead')}</p><div style={{ marginTop: 24 }}><div className="u-country-card"><div className="u-result-icon"><LockKeyhole size={19} /></div><p className="u-lead">{t('tipTwo')}</p></div></div></div>
      <div className="u-tips">{[1, 2, 3, 4].map((n) => <article className="u-tip" key={n} data-testid={`card-safety-tip-${n}`}><span>0{n}</span><h3>{t(`tip${['One', 'Two', 'Three', 'Four'][n - 1]}Title` as CopyKey)}</h3><p>{t(`tip${['One', 'Two', 'Three', 'Four'][n - 1]}` as CopyKey)}</p></article>)}</div>
    </div></section>

    <section className="u-section u-container" id="report" data-testid="section-report-scam">
      <div className="u-section-head"><div><div className="u-eyebrow">{t('report')}</div><h2 className="u-section-title">{t('reportTitle')}</h2></div><p className="u-lead">{t('reportLead')}</p></div>
      <div className="u-report-grid">
        <aside className="u-report-intro"><div className="u-eyebrow light"><FileCheck2 size={14} /> {t('reviewDesk')}</div><h3>{t('reportTitle')}</h3><p>{t('reportLead')}</p><p><LockKeyhole size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />{t('proofHelp')}</p></aside>
        <form className="u-panel u-report-form" onSubmit={submitReport} data-testid="form-safety-report">
          {formMessage && <div className={`u-form-message ${formError ? 'error' : ''}`} role="status" data-testid="status-report-submit">{formMessage}</div>}
          <div><label className="u-label" htmlFor="report-number">{t('phone')}</label><input className="u-input" id="report-number" value={reportPhone} onChange={(e) => setReportPhone(e.target.value)} placeholder={t('phonePlaceholder')} minLength={6} maxLength={32} required data-testid="input-report-phone" /></div>
          <div><label className="u-label" htmlFor="report-category">{t('category')}</label><select className="u-select" id="report-category" value={reportCategory} onChange={(e) => setReportCategory(e.target.value as ReportCategory)} required data-testid="select-report-category"><option value="">{t('chooseCategory')}</option>{categories.map((c) => <option value={c} key={c}>{categoryLabels[c][language]}</option>)}</select></div>
          <div><label className="u-label" htmlFor="report-description">{t('description')}</label><textarea className="u-textarea" id="report-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('descriptionHint')} minLength={10} maxLength={3000} required data-testid="textarea-report-description" /></div>
          <div><span className="u-label">{t('proof')}</span><label className="u-upload" htmlFor="report-proof"><Upload size={16} /><span>{proof ? proof.name : t('proof')}<small style={{ display: 'block', marginTop: 4 }}>{t('proofHelp')}</small></span><FileImage size={16} style={{ marginLeft: 'auto' }} /><input id="report-proof" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const file = e.target.files?.[0]; if (file && file.size <= 10485760 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setProof(file); setFormMessage(''); } else if (file) { setFormError(true); setFormMessage(t('uploadError')); } }} data-testid="input-report-proof" /></label>{proof && <button type="button" className="u-btn ghost" style={{ marginTop: 7, minHeight: 33 }} onClick={() => setProof(null)} data-testid="button-remove-proof">{t('removeFile')}</button>}</div>
          <div><label className="u-label" htmlFor="reporter-phone">{t('reporterPhone')}</label><input className="u-input" id="reporter-phone" value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)} maxLength={32} placeholder={t('phonePlaceholder')} data-testid="input-reporter-phone" /></div>
          <button className="u-btn" type="submit" disabled={submitMutation.isPending || uploadMutation.isPending} data-testid="button-submit-report">{submitMutation.isPending || uploadMutation.isPending ? t('loading') : t('submitReport')}<ArrowRight size={15} /></button>
        </form>
      </div>
    </section>

    <section className="u-section alt" id="recent" data-testid="section-recent-reports"><div className="u-container">
      <div className="u-section-head"><div><div className="u-eyebrow">{t('recentTitle')}</div><h2 className="u-section-title">{t('recentTitle')}</h2></div><p className="u-lead">{t('recentLead')}</p></div>
      {recent.isLoading ? <div className="u-skeleton" /> : recent.isError ? <InlineError text={t('error')} retry={() => recent.refetch()} retryText={t('retry')} /> : !recent.data?.length ? <div className="u-empty" data-testid="empty-recent-reports">{t('recentEmpty')}</div> : <div className="u-recent-list" data-testid="list-recent-reports">{recent.data.map((item, i) => <article className="u-recent" key={`${item.phoneNumber}-${item.category}-${i}`} data-testid={`card-public-report-${i}`}><div><strong>{item.phoneNumber}</strong><span>{categoryLabels[item.category][language]} · {t('latest')} {new Date(item.latestReportedAt).toLocaleDateString(language)}</span></div><span className="u-tag">{item.reportCount} {t('reportCount')}</span></article>)}</div>}
    </div></section>

    <section className="u-section u-container" id="how" data-testid="section-how-it-works"><div className="u-section-head"><div><div className="u-eyebrow">{t('how')}</div><h2 className="u-section-title">{t('howTitle')}</h2></div></div><div className="u-info-grid">{[1, 2, 3].map((n) => <article className="u-info" key={n}><span className="num">0{n}</span><h3>{t(`how${['One', 'Two', 'Three'][n - 1]}` as CopyKey)}</h3><p>{t(`how${['One', 'Two', 'Three'][n - 1]}Copy` as CopyKey)}</p></article>)}</div></section>
    <section className="u-section dark" id="about" data-testid="section-about"><div className="u-container"><div className="u-eyebrow light">{t('about')}</div><h2 className="u-section-title">{t('aboutTitle')}</h2><p className="u-lead" style={{ color: '#d1ddd1', marginTop: 16, maxWidth: 750 }}>{t('aboutCopy')}</p></div></section>
    <section className="u-section u-container" id="privacy" data-testid="section-privacy"><div className="u-eyebrow">{t('privacy')}</div><h2 className="u-section-title">{t('privacy')}</h2><p className="u-lead" style={{ marginTop: 15, maxWidth: 760 }}>{t('privacyCopy')}</p></section>
    <footer className="u-footer" id="contact" data-testid="footer-main"><div className="u-container"><div className="u-footer-grid"><div><Brand /><p>{t('footer')}</p></div><div><h3>{t('how')}</h3><button onClick={() => go('check')}>{t('check')}</button><button onClick={() => go('report')}>{t('report')}</button><button onClick={() => go('providers')}>{t('providers')}</button></div><div><h3>UMUNARA</h3><a href="#about">{t('about')}</a><a href="#how">{t('how')}</a><a href="#privacy">{t('privacy')}</a><a href="#contact">{t('contact')}</a><a href="/admin">{t('admin')}</a></div></div><div className="u-footer-bottom"><span>© UMUNARA · RWANDA</span><span>{t('privacy')} · EN / RW / FR</span></div></div></footer>
  </main>;
}

function ProviderRow({ provider, t }: { provider: TransferProvider; t: Translator }) {
  const connections = [provider.worksWithMomo && t('momo'), provider.worksWithAirtel && t('airtel'), provider.worksWithBanks && t('banks')].filter(Boolean).join(' · ') || '—';
  const isSourced = Boolean(provider.sourceUrl && provider.verifiedAt);
  return <article className="u-provider" data-testid={`card-provider-${provider.id}`}><span className="u-provider-logo">{provider.logoText}</span><div><h3>{provider.name}</h3><p>{t('worksWith')}: {connections}</p><small>{t('fee')}: {isSourced ? provider.feeInformation || t('unverified') : t('unverified')} · {t('speed')}: {isSourced ? provider.speedInformation || t('unverified') : t('unverified')}</small>{provider.sourceUrl && <small><a href={provider.sourceUrl} target="_blank" rel="noreferrer" style={{ color: '#52735b' }}>{t('source')}</a>{provider.verifiedAt ? ` · ${t('verifiedOn')} ${new Date(provider.verifiedAt).toLocaleDateString()}` : ''}</small>}</div><span className="u-tag">{isSourced ? t('verified') : t('unverified')}</span></article>;
}

function InlineError({ text, retry, retryText }: { text: string; retry: () => void; retryText: string }) {
  return <div className="u-error" role="alert" data-testid="status-load-error"><span>{text}</span><button onClick={retry} data-testid="button-retry">{retryText}</button></div>;
}

function Admin({ language, t, auth }: { language: Language; t: Translator; auth: AuthState }) {
  const [tab, setTab] = useState<'overview' | 'reports' | 'users' | 'providers'>('overview');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [edit, setEdit] = useState<TransferProvider | null>(null);
  const [showProviderForm, setShowProviderForm] = useState(false);
  const queryClient = useQueryClient();
  const queryParams = useMemo(() => ({ ...(status ? { status: status as ReportStatus } : {}), ...(search.trim() ? { search: search.trim() } : {}) }), [status, search]);
  const queryEnabled = auth.isAuthenticated;
  const summary = useGetAdminSummary({ query: { enabled: queryEnabled, queryKey: getGetAdminSummaryQueryKey() } });
  const reports = useListAdminReports(queryParams, { query: { enabled: queryEnabled, queryKey: getListAdminReportsQueryKey(queryParams) } });
  const users = useListAdminUsers({ query: { enabled: queryEnabled, queryKey: getListAdminUsersQueryKey() } });
  const providers = useListAdminProviders({ query: { enabled: queryEnabled, queryKey: getListAdminProvidersQueryKey() } });
  const updateStatus = useUpdateReportStatus();
  const createProvider = useCreateTransferProvider();
  const updateProvider = useUpdateTransferProvider();
  const invalidateAdmin = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListAdminReportsQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListAdminProvidersQueryKey() }),
      queryClient.invalidateQueries({ queryKey: getListTransferProvidersQueryKey() }),
    ]);
  };
  const saveProvider = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload: TransferProviderInput = {
      name: String(data.get('name') || ''),
      logoText: String(data.get('logoText') || ''),
      worksWithMomo: data.get('momo') === 'on',
      worksWithAirtel: data.get('airtel') === 'on',
      worksWithBanks: data.get('banks') === 'on',
      feeInformation: String(data.get('fee') || '') || null,
      speedInformation: String(data.get('speed') || '') || null,
      sourceUrl: String(data.get('source') || '') || null,
      verifiedAt: String(data.get('verifiedAt') || '') || null,
      published: data.get('published') === 'on',
    };
    if (edit) {
      updateProvider.mutate({ providerId: edit.id, data: payload }, { onSuccess: async () => { await invalidateAdmin(); setShowProviderForm(false); setEdit(null); } });
    } else {
      createProvider.mutate({ data: payload }, { onSuccess: async () => { await invalidateAdmin(); setShowProviderForm(false); } });
    }
  };
  const isLoading = auth.isLoading;
  return <main className="umunara u-admin">
    <div className="u-admin-top"><div className="u-container u-admin-head"><Brand /><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><a href="/" style={{ color: '#f2e9ce', fontSize: 11, textDecoration: 'none' }} data-testid="link-public-home">UMUNARA public hub</a>{auth.isAuthenticated && <button className="u-btn gold" onClick={auth.logout} data-testid="button-admin-logout">{t('signOut')}</button>}</div></div></div>
    <div className="u-container u-admin-main">
      <div className="u-eyebrow">{t('admin')}</div><h1>{t('adminTitle')}</h1>
      {isLoading ? <><div className="u-skeleton" /><div className="u-skeleton" /></> : !auth.isAuthenticated ? <div className="u-panel" style={{ maxWidth: 650 }} data-testid="admin-protected"><div className="u-result-icon"><LockKeyhole size={19} /></div><h2 style={{ font: "700 21px 'Manrope',sans-serif" }}>{t('protected')}</h2><p className="u-lead">{t('protectedCopy')}</p><button className="u-btn" style={{ marginTop: 18 }} onClick={auth.login} data-testid="button-admin-sign-in">{t('signIn')}<ArrowRight size={15} /></button></div> : <>
        {summary.isError ? <InlineError text={t('error')} retry={() => summary.refetch()} retryText={t('retry')} /> : summary.isLoading ? <div className="u-stat-grid">{[0, 1, 2, 3, 4, 5].map((i) => <div className="u-skeleton" key={i} />)}</div> : summary.data && <div className="u-stat-grid" data-testid="admin-summary">{[
          [t('totalReports'), summary.data.totalReports], [t('pendingReports'), summary.data.pendingReports], [t('approvedReports'), summary.data.approvedReports], [t('reportedNumbers'), summary.data.reportedNumbers], [t('numberChecks'), summary.data.numberChecks], [t('registeredUsers'), summary.data.registeredUsers],
        ].map(([label, value]) => <article className="u-stat" key={String(label)}><b>{value}</b><span>{label}</span></article>)}</div>}
        <div className="u-admin-tabs" role="tablist">{(['overview', 'reports', 'users', 'providers'] as const).map((key) => <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)} role="tab" aria-selected={tab === key} data-testid={`admin-tab-${key}`}>{t(key === 'reports' ? 'moderation' : key === 'providers' ? 'manageProviders' : key)}</button>)}</div>
        {tab === 'overview' && <div className="u-panel"><div className="u-eyebrow"><ShieldCheck size={14} /> UMUNARA</div><h2 style={{ font: "700 21px 'Manrope',sans-serif" }}>{t('adminTitle')}</h2><p className="u-lead">{t('recentLead')}</p><button className="u-btn" style={{ marginTop: 18 }} onClick={() => setTab('reports')} data-testid="button-open-moderation">{t('moderation')}<ArrowRight size={14} /></button></div>}
        {tab === 'reports' && <section className="u-panel" data-testid="admin-report-management"><div className="u-form-row" style={{ marginBottom: 18 }}><input className="u-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('searchReports')} data-testid="input-admin-report-search" /><select className="u-select" style={{ maxWidth: 190 }} value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-admin-report-status"><option value="">{t('allStatuses')}</option>{callCodes.map((item) => <option value={item.value} key={item.value}>{statusLabels[item.value][language]}</option>)}</select></div>
          {reports.isLoading ? <div className="u-skeleton" /> : reports.isError ? <InlineError text={t('error')} retry={() => reports.refetch()} retryText={t('retry')} /> : !reports.data?.length ? <div className="u-empty" data-testid="empty-admin-reports">{t('noReports')}</div> : <table className="u-admin-table"><thead><tr><th>{t('phone')}</th><th>{t('category')}</th><th>{t('status')}</th><th>{t('reportDetails')}</th><th>{t('reporter')}</th><th>{t('evidence')}</th><th>Actions</th></tr></thead><tbody>{reports.data.map((report) => <AdminReportRow key={report.id} report={report} language={language} t={t} pending={updateStatus.isPending} onStatus={(next) => updateStatus.mutate({ reportId: report.id, data: { status: next } }, { onSuccess: invalidateAdmin })} />)}</tbody></table>}
        </section>}
        {tab === 'users' && <section className="u-panel" data-testid="admin-users">{users.isLoading ? <div className="u-skeleton" /> : users.isError ? <InlineError text={t('error')} retry={() => users.refetch()} retryText={t('retry')} /> : !users.data?.length ? <div className="u-empty" data-testid="empty-admin-users">{t('noUsers')}</div> : <table className="u-admin-table"><thead><tr><th>{t('reporter')}</th><th>{t('email')}</th><th>{t('status')}</th><th>{t('created')}</th></tr></thead><tbody>{users.data.map((user) => <tr key={user.id} data-testid={`row-admin-user-${user.id}`}><td data-label={t('reporter')}>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</td><td data-label={t('email')}>{user.email || '—'}</td><td data-label={t('status')}>{user.id}</td><td data-label={t('created')}>{new Date(user.createdAt).toLocaleDateString(language)}</td></tr>)}</tbody></table>}</section>}
        {tab === 'providers' && <section className="u-panel" data-testid="admin-providers"><div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center', marginBottom: 15 }}><div><div className="u-eyebrow">{t('manageProviders')}</div><p className="u-form-help">{t('providerLead')}</p></div><button className="u-btn" onClick={() => { setEdit(null); setShowProviderForm(!showProviderForm); }} data-testid="button-add-provider">{t('providerAdd')}</button></div>
          {showProviderForm && <ProviderForm edit={edit} t={t} busy={createProvider.isPending || updateProvider.isPending} onSubmit={saveProvider} onCancel={() => { setShowProviderForm(false); setEdit(null); }} />}
          {providers.isLoading ? <div className="u-skeleton" /> : providers.isError ? <InlineError text={t('error')} retry={() => providers.refetch()} retryText={t('retry')} /> : !providers.data?.length ? <div className="u-empty">{t('noProviders')}</div> : <table className="u-admin-table"><thead><tr><th>{t('providerName')}</th><th>{t('worksWith')}</th><th>{t('fee')} / {t('speed')}</th><th>{t('published')}</th><th>{t('actions')}</th></tr></thead><tbody>{providers.data.map((p) => <tr key={p.id} data-testid={`row-admin-provider-${p.id}`}><td data-label={t('providerName')}><strong>{p.name}</strong><br />{p.logoText}</td><td data-label={t('worksWith')}>{[p.worksWithMomo && t('momo'), p.worksWithAirtel && t('airtel'), p.worksWithBanks && t('banks')].filter(Boolean).join(', ')}</td><td data-label={`${t('fee')} / ${t('speed')}`}>{p.feeInformation || t('unverified')}<br />{p.speedInformation || t('unverified')}</td><td data-label={t('published')}><span className={`u-status ${p.published ? 'approved' : ''}`}>{p.published ? t('published') : '—'}</span></td><td data-label={t('actions')}><button className="u-btn ghost" onClick={() => { setEdit(p); setShowProviderForm(true); }} data-testid={`button-edit-provider-${p.id}`}>{t('providerEdit')}</button></td></tr>)}</tbody></table>}
        </section>}
      </>}
    </div>
  </main>;
}

function AdminReportRow({ report, language, t, onStatus, pending }: { report: AdminReport; language: Language; t: Translator; onStatus: (status: ReportStatus) => void; pending: boolean }) {
  const statusOptions: Array<{ value: ReportStatus; label: CopyKey }> = [{ value: 'approved', label: 'approve' }, { value: 'stopped', label: 'stop' }, { value: 'cleaned', label: 'clean' }, { value: 'deleted', label: 'delete' }];
  return <tr data-testid={`row-admin-report-${report.id}`}>
    <td data-label={t('phone')}><strong>{report.phoneNumber}</strong><br /><small>{new Date(report.createdAt).toLocaleString(language)}</small></td>
    <td data-label={t('category')}>{categoryLabels[report.category][language]}</td>
    <td data-label={t('status')}><span className={`u-status ${report.status}`}>{statusLabels[report.status]?.[language] || report.status}</span></td>
    <td data-label={t('reportDetails')} style={{ maxWidth: 280 }}>{report.description}</td>
    <td data-label={t('reporter')}>{report.reporterEmail || report.reporterPhone || '—'}</td>
    <td data-label={t('evidence')}>{report.evidenceObjectPath ? <a href={`/api/storage${report.evidenceObjectPath}`} target="_blank" rel="noreferrer" style={{ color: '#315c40' }} data-testid={`link-private-evidence-${report.id}`}>{t('evidence')}</a> : t('noEvidence')}</td>
    <td data-label={t('actions')}><div className="u-table-actions">{statusOptions.map((option) => <button key={option.value} onClick={() => onStatus(option.value)} disabled={pending || report.status === option.value} data-testid={`button-report-${option.value}-${report.id}`}>{t(option.label)}</button>)}</div></td>
  </tr>;
}

function ProviderForm({ edit, t, busy, onSubmit, onCancel }: { edit: TransferProvider | null; t: Translator; busy: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return <form className="u-panel" style={{ background: '#f0eee5', marginBottom: 16, display: 'grid', gap: 12 }} onSubmit={onSubmit} data-testid="form-provider">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><label><span className="u-label">{t('providerName')}</span><input name="name" className="u-input" required minLength={2} maxLength={120} defaultValue={edit?.name || ''} data-testid="input-provider-name" /></label><label><span className="u-label">{t('logoText')}</span><input name="logoText" className="u-input" required maxLength={30} defaultValue={edit?.logoText || ''} data-testid="input-provider-logo" /></label></div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 11 }}><label><input type="checkbox" name="momo" defaultChecked={edit?.worksWithMomo} /> {t('worksMomo')}</label><label><input type="checkbox" name="airtel" defaultChecked={edit?.worksWithAirtel} /> {t('worksAirtel')}</label><label><input type="checkbox" name="banks" defaultChecked={edit?.worksWithBanks} /> {t('worksBanks')}</label><label><input type="checkbox" name="published" defaultChecked={edit?.published} /> {t('published')}</label></div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}><label><span className="u-label">{t('feeInfo')}</span><input name="fee" className="u-input" maxLength={500} defaultValue={edit?.feeInformation || ''} /></label><label><span className="u-label">{t('speedInfo')}</span><input name="speed" className="u-input" maxLength={300} defaultValue={edit?.speedInformation || ''} /></label><label><span className="u-label">{t('sourceUrl')}</span><input name="source" type="url" className="u-input" defaultValue={edit?.sourceUrl || ''} /></label><label><span className="u-label">{t('verifiedOn')}</span><input name="verifiedAt" type="date" className="u-input" defaultValue={edit?.verifiedAt ? edit.verifiedAt.slice(0, 10) : ''} /></label></div>
    <div style={{ display: 'flex', gap: 8 }}><button className="u-btn" type="submit" disabled={busy} data-testid="button-save-provider">{busy ? t('loading') : t('save')}</button><button className="u-btn ghost" type="button" onClick={onCancel} data-testid="button-cancel-provider">{t('cancel')}</button></div>
  </form>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={AppShell} /><Route path="/admin" component={AppShell} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
