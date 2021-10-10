<?php

namespace App\Controller;

use App\Entity\RunYoutube;
use App\Form\RunYoutubeType;
use Doctrine\ORM\EntityManagerInterface;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\IsGranted;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * @Route("/forms", name="forms")
 * @IsGranted("IS_AUTHENTICATED_FULLY")
 */
class FormsController extends AbstractController
{
    private EntityManagerInterface $em;
    private HttpClientInterface $client;

    public function __construct(EntityManagerInterface $em, HttpClientInterface $client)
    {
        $this->em = $em;
        $this->client = $client;
    }

    /**
     * @Route("/run/youtube", name="_run_youtube")
     * @param Request $request
     * @return Response
     */
    public function runYoutube(Request $request): Response
    {
        $runYoutube = new RunYoutube();
        $runYoutube->setUser($this->getUser());

        $form = $this->createForm(RunYoutubeType::class, $runYoutube);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            /** @var RunYoutube $runYoutube */
            $runYoutube = $form->getData();

            $this->em->persist($runYoutube);
            $this->em->flush();

            $this->client->request("POST", $_ENV["DISCORD_RUN_YOUTUBE_WEBHOOK"], [
                "body" => [
                    "content" => "Utilisateur : <@!" . $runYoutube->getUser()->getDiscordId() . ">\n"
                        . "Description : " . $runYoutube->getDescription() . "\n"
                        . "Casque : " . $runYoutube->getHeadset()->getName() . "\n"
                        . "Grip : " . $runYoutube->getGrip() . "\n"
                        . "Profil Twitch : " . $runYoutube->getTwitchLink() . "\n"
                        . "Profil ScoreSaber : " . $runYoutube->getScoresaberLink() . "\n"
                        . "Leaderboard de la map : " . $runYoutube->getMapLink() . "\n"
                        . "Lien de la vidéo : " . $runYoutube->getVideoLink()
                ]
            ]);

            $this->addFlash("success", "Votre vidéo a bien été envoyée.");

            return $this->redirectToRoute("home");
        }

        return $this->render('forms/runYoutube.html.twig', [
            'form' => $form->createView()
        ]);
    }
}
