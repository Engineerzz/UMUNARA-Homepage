export type GuideLanguage = "en" | "fr" | "rw";

type LocalizedText = Record<GuideLanguage, string>;

export interface TransferGuideItem {
  id: string;
  name: string;
  shortName: string;
  channel: LocalizedText;
  steps: Record<GuideLanguage, string[]>;
  fees: LocalizedText;
  delivery: LocalizedText;
  warning: LocalizedText;
  officialUrl: string;
}

export const transferGuide: TransferGuideItem[] = [
  {
    id: "mtn-momo",
    name: "MTN MoMo",
    shortName: "MTN",
    channel: {
      en: "Rwanda mobile wallet",
      fr: "Portefeuille mobile au Rwanda",
      rw: "Umufuka w'amafaranga wa telefoni mu Rwanda",
    },
    steps: {
      en: [
        "Open the official MTN MoMo app or current USSD menu and choose Send Money.",
        "Enter the recipient number, then check the displayed name and amount.",
        "Review the fee on screen and confirm only in the official MoMo flow.",
      ],
      fr: [
        "Ouvrez l’application officielle MTN MoMo ou le menu USSD actuel, puis choisissez Envoyer de l’argent.",
        "Saisissez le numéro du destinataire et vérifiez le nom affiché et le montant.",
        "Vérifiez les frais à l’écran et confirmez uniquement dans le parcours officiel MoMo.",
      ],
      rw: [
        "Fungura porogaramu yemewe ya MTN MoMo cyangwa menu ya USSD igezweho, uhitemo Kohereza amafaranga.",
        "Andika nimero y'uwakira, urebe izina rigaragara n'amafaranga wohereza.",
        "Reba ikiguzi kuri ecran, wemeze ukoresheje uburyo bwemewe bwa MoMo gusa.",
      ],
    },
    fees: {
      en: "The fee is shown before confirmation and varies by amount and transaction type.",
      fr: "Les frais sont affichés avant la confirmation et varient selon le montant et le type d’opération.",
      rw: "Ikiguzi kigaragara mbere yo kwemeza; gihinduka bitewe n'amafaranga n'ubwoko bw'igikorwa.",
    },
    delivery: {
      en: "Check the transaction estimate in the official menu; network conditions can affect delivery.",
      fr: "Consultez l’estimation dans le menu officiel ; l’état du réseau peut retarder la réception.",
      rw: "Reba igihe kigaragazwa muri menu yemewe; imikorere y'urusobe ishobora gutinza amafaranga.",
    },
    warning: {
      en: "Never share your PIN or one-time code. Do not pay anyone to unlock an incoming transfer.",
      fr: "Ne communiquez jamais votre code PIN ni votre code temporaire. Ne payez personne pour débloquer un transfert reçu.",
      rw: "Ntugasangize umuntu PIN cyangwa kode y'igihe gito. Ntukishyure umuntu ngo afungure amafaranga akugenewe.",
    },
    officialUrl: "https://www.mtn.co.rw/",
  },
  {
    id: "airtel-money",
    name: "Airtel Money",
    shortName: "AIRTEL",
    channel: {
      en: "Rwanda mobile wallet",
      fr: "Portefeuille mobile au Rwanda",
      rw: "Umufuka w'amafaranga wa telefoni mu Rwanda",
    },
    steps: {
      en: [
        "Use the official Airtel Money app or current USSD menu and select the transfer option.",
        "Enter the recipient details and verify the name, number, and amount before continuing.",
        "Review the displayed fee and confirm inside the official Airtel Money flow.",
      ],
      fr: [
        "Utilisez l’application officielle Airtel Money ou le menu USSD actuel et choisissez le transfert.",
        "Saisissez les coordonnées du destinataire et vérifiez son nom, son numéro et le montant.",
        "Vérifiez les frais affichés et confirmez dans le parcours officiel Airtel Money.",
      ],
      rw: [
        "Koresha porogaramu yemewe ya Airtel Money cyangwa menu ya USSD igezweho, uhitemo kohereza amafaranga.",
        "Andika amakuru y'uwakira, ugenzure izina, nimero n'amafaranga mbere yo gukomeza.",
        "Reba ikiguzi kigaragara, wemeze ukoresheje uburyo bwemewe bwa Airtel Money gusa.",
      ],
    },
    fees: {
      en: "The fee is shown before confirmation and varies by amount and transaction type.",
      fr: "Les frais sont affichés avant la confirmation et varient selon le montant et le type d’opération.",
      rw: "Ikiguzi kigaragara mbere yo kwemeza; gihinduka bitewe n'amafaranga n'ubwoko bw'igikorwa.",
    },
    delivery: {
      en: "Check the transaction estimate in the official menu; network conditions can affect delivery.",
      fr: "Consultez l’estimation dans le menu officiel ; l’état du réseau peut retarder la réception.",
      rw: "Reba igihe kigaragazwa muri menu yemewe; imikorere y'urusobe ishobora gutinza amafaranga.",
    },
    warning: {
      en: "A support agent should never ask for your PIN or one-time code. Verify unexpected payment requests independently.",
      fr: "Un agent d’assistance ne doit jamais demander votre code PIN ou temporaire. Vérifiez séparément toute demande de paiement inattendue.",
      rw: "Umukozi w'ubufasha ntazagusaba PIN cyangwa kode y'igihe gito. Banza ugenzure ahandi iyo bagusabye kwishyura utari witeze.",
    },
    officialUrl: "https://www.airtel.co.rw/",
  },
  {
    id: "western-union",
    name: "Western Union",
    shortName: "WU",
    channel: {
      en: "International transfer; payout options depend on the route",
      fr: "Transfert international ; les modes de réception dépendent du trajet",
      rw: "Kohereza mu mahanga; uburyo bwo kwakira buterwa n'aho amafaranga ava",
    },
    steps: {
      en: [
        "Start with the official Western Union app, website, or an authorized agent.",
        "Choose Rwanda and select a payout method that is offered for your route.",
        "Compare the fee and exchange rate before paying; share the tracking number only with the intended recipient.",
      ],
      fr: [
        "Commencez sur l’application ou le site officiel Western Union, ou chez un agent agréé.",
        "Choisissez le Rwanda et un mode de réception proposé pour votre trajet.",
        "Comparez les frais et le taux de change avant de payer ; partagez le numéro de suivi uniquement avec le destinataire.",
      ],
      rw: [
        "Tangira kuri porogaramu cyangwa urubuga byemewe bya Western Union, cyangwa ku mukozi wemewe.",
        "Hitamo u Rwanda n'uburyo bwo kwakira amafaranga buboneka ku nzira ukoresha.",
        "Gereranya ikiguzi n'ivunjisha mbere yo kwishyura; nimero yo gukurikirana uyisangize ugiye guha amafaranga gusa.",
      ],
    },
    fees: {
      en: "The quote shows the fee and exchange rate; both can vary by sender country, amount, and payout method.",
      fr: "Le devis indique les frais et le taux de change ; ils varient selon le pays d’envoi, le montant et le mode de réception.",
      rw: "Igiciro kigaragaza ikiguzi n'ivunjisha; bihinduka bitewe n'igihugu, amafaranga n'uburyo bwo kuyakira.",
    },
    delivery: {
      en: "The provider gives an estimate for each route; check it before sending.",
      fr: "Le fournisseur donne une estimation pour chaque trajet ; vérifiez-la avant l’envoi.",
      rw: "Umutanga serivisi agaragaza igihe giteganyijwe kuri buri nzira; banza ukigenzure.",
    },
    warning: {
      en: "Keep the tracking number private. Never send money to someone who claims a fee is needed to release your transfer.",
      fr: "Gardez le numéro de suivi privé. N’envoyez jamais d’argent à quelqu’un qui prétend qu’il faut payer pour débloquer le transfert.",
      rw: "Bika nimero yo gukurikirana mu ibanga. Ntukohereze amafaranga ku muntu uvuga ko ugomba kwishyura kugira ngo amafaranga yawe afungurwe.",
    },
    officialUrl: "https://www.westernunion.com/",
  },
  {
    id: "moneygram",
    name: "MoneyGram",
    shortName: "MG",
    channel: {
      en: "International transfer; payout options depend on the route",
      fr: "Transfert international ; les modes de réception dépendent du trajet",
      rw: "Kohereza mu mahanga; uburyo bwo kwakira buterwa n'aho amafaranga ava",
    },
    steps: {
      en: [
        "Use the official MoneyGram app, website, or an authorized agent.",
        "Select Rwanda and choose one of the available receiving methods shown for your transfer.",
        "Check the total fee, exchange rate, and recipient details before confirming.",
      ],
      fr: [
        "Utilisez l’application ou le site officiel MoneyGram, ou rendez-vous chez un agent agréé.",
        "Sélectionnez le Rwanda et choisissez un mode de réception proposé pour votre transfert.",
        "Vérifiez les frais totaux, le taux de change et les coordonnées du destinataire avant de confirmer.",
      ],
      rw: [
        "Koresha porogaramu cyangwa urubuga byemewe bya MoneyGram, cyangwa ujye ku mukozi wemewe.",
        "Hitamo u Rwanda n'uburyo bwo kwakira bugaragazwa kuri transfer yawe.",
        "Reba ikiguzi cyose, ivunjisha n'amakuru y'uwakira mbere yo kwemeza.",
      ],
    },
    fees: {
      en: "Fees and exchange rates vary by sender location, amount, funding method, and payout method; review the live quote.",
      fr: "Les frais et taux varient selon le lieu d’envoi, le montant, le paiement et le retrait ; consultez le devis en direct.",
      rw: "Ibiciro n'ivunjisha bihinduka bitewe n'aho wohereza, amafaranga n'uburyo bwo kwishyura no kwakira; reba igiciro cy'ako kanya.",
    },
    delivery: {
      en: "Availability and delivery estimates vary by route and receiving method.",
      fr: "La disponibilité et les délais varient selon le trajet et le mode de réception.",
      rw: "Kuboneka n'igihe cyo kugera birahinduka bitewe n'inzira n'uburyo bwo kwakira.",
    },
    warning: {
      en: "Only use official channels. Do not share verification codes or send a second payment to release a transfer.",
      fr: "Utilisez uniquement les canaux officiels. Ne partagez aucun code de vérification et ne payez pas une seconde fois pour débloquer un transfert.",
      rw: "Koresha inzira zemewe gusa. Ntugasangize umuntu kode zo kugenzura kandi ntukishyure ubwa kabiri ngo amafaranga afungurwe.",
    },
    officialUrl: "https://www.moneygram.com/",
  },
  {
    id: "ria",
    name: "Ria Money Transfer",
    shortName: "RIA",
    channel: {
      en: "International transfer; confirm available Rwanda payout methods",
      fr: "Transfert international ; vérifiez les modes de réception disponibles au Rwanda",
      rw: "Kohereza mu mahanga; genzura uburyo bwo kwakira buboneka mu Rwanda",
    },
    steps: {
      en: [
        "Start in the official Ria app or website, or visit an authorized location.",
        "Choose Rwanda and a receiving method shown as available for your route.",
        "Check the quote and recipient information, then follow the official payment instructions.",
      ],
      fr: [
        "Commencez sur l’application ou le site officiel Ria, ou rendez-vous dans un point agréé.",
        "Choisissez le Rwanda et un mode de réception proposé pour votre trajet.",
        "Vérifiez le devis et les coordonnées du destinataire, puis suivez les instructions de paiement officielles.",
      ],
      rw: [
        "Tangira kuri porogaramu cyangwa urubuga byemewe bya Ria, cyangwa ujye ahantu hemewe.",
        "Hitamo u Rwanda n'uburyo bwo kwakira bugaragazwa ko buboneka ku nzira yawe.",
        "Genzura igiciro n'amakuru y'uwakira, ukurikize amabwiriza yemewe yo kwishyura.",
      ],
    },
    fees: {
      en: "Fees and exchange rates depend on the sending country, amount, payment method, and payout option; check the current quote.",
      fr: "Les frais et taux dépendent du pays d’envoi, du montant, du paiement et du retrait ; vérifiez le devis actuel.",
      rw: "Ikiguzi n'ivunjisha biterwa n'igihugu, amafaranga, uburyo bwo kwishyura no kwakira; genzura igiciro kiriho.",
    },
    delivery: {
      en: "Timing and payout availability are route-specific; use the estimate shown by Ria.",
      fr: "Les délais et la disponibilité dépendent du trajet ; consultez l’estimation indiquée par Ria.",
      rw: "Igihe n'uburyo bwo kwakira biterwa n'inzira; koresha igihe Ria igaragaza.",
    },
    warning: {
      en: "Never share a PIN or verification code, and ignore anyone asking for an extra payment to receive money.",
      fr: "Ne partagez jamais de code PIN ni de vérification, et ignorez toute demande de paiement supplémentaire pour recevoir de l’argent.",
      rw: "Ntugasangize umuntu PIN cyangwa kode yo kugenzura, wirengagize ugusaba andi mafaranga kugira ngo wakire ayawe.",
    },
    officialUrl: "https://www.riamoneytransfer.com/",
  },
  {
    id: "worldremit",
    name: "WorldRemit",
    shortName: "WR",
    channel: {
      en: "Online international transfer; options depend on the route",
      fr: "Transfert international en ligne ; les options dépendent du trajet",
      rw: "Kohereza amafaranga mu mahanga kuri interineti; amahitamo aterwa n'inzira",
    },
    steps: {
      en: [
        "Use the official WorldRemit app or website and select Rwanda as the destination.",
        "Choose an available payout method and enter the recipient details carefully.",
        "Review the fee, exchange rate, and delivery estimate before paying in the app or site.",
      ],
      fr: [
        "Utilisez l’application ou le site officiel WorldRemit et choisissez le Rwanda comme destination.",
        "Choisissez un mode de réception disponible et saisissez soigneusement les coordonnées du destinataire.",
        "Vérifiez les frais, le taux de change et le délai avant de payer sur l’application ou le site.",
      ],
      rw: [
        "Koresha porogaramu cyangwa urubuga byemewe bya WorldRemit, uhitemo u Rwanda nk'aho amafaranga ajya.",
        "Hitamo uburyo bwo kwakira buboneka, wandike neza amakuru y'uwakira.",
        "Reba ikiguzi, ivunjisha n'igihe cyo kugera mbere yo kwishyura muri porogaramu cyangwa ku rubuga.",
      ],
    },
    fees: {
      en: "The live quote shows fees and exchange rate; they vary by sender country, amount, and payout method.",
      fr: "Le devis en direct indique les frais et le taux ; ils varient selon le pays d’envoi, le montant et le retrait.",
      rw: "Igiciro cy'ako kanya kigaragaza ikiguzi n'ivunjisha; bihinduka bitewe n'igihugu, amafaranga n'uburyo bwo kwakira.",
    },
    delivery: {
      en: "Use the delivery estimate shown for your selected route and payout method.",
      fr: "Consultez le délai indiqué pour le trajet et le mode de réception choisis.",
      rw: "Reba igihe kigaragazwa ku nzira n'uburyo bwo kwakira wahisemo.",
    },
    warning: {
      en: "WorldRemit will not ask you to pay a stranger to release funds. Keep your password and verification codes private.",
      fr: "WorldRemit ne vous demandera pas de payer un inconnu pour débloquer des fonds. Gardez votre mot de passe et vos codes privés.",
      rw: "WorldRemit ntizagusaba kwishyura umuntu utazi ngo amafaranga afungurwe. Bika ijambo ry'ibanga na kode mu ibanga.",
    },
    officialUrl: "https://www.worldremit.com/",
  },
];
