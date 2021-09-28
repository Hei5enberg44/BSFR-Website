<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/", name="home")
 */
class HomeController extends AbstractController
{
    /**
     * @Route("", name="")
     */
    public function index(): Response
    {
        return $this->render('home/index.html.twig', [
            "discord_invite" => $_ENV["DISCORD_INVITE"]
        ]);
    }
}
