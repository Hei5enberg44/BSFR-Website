<?php

namespace App\Controller;

use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class DiscordController extends AbstractController
{
    /**
     * @Route("/login", name="login_start")
     */
    public function connectAction(ClientRegistry $clientRegistry, Request $request)
    {
        return $clientRegistry->getClient('discord_main')->redirect(['identify']);
    }

    /**
     * @Route("/login/check", name="login_check")
     */
    public function connectCheckAction(Request $request, ClientRegistry $clientRegistry)
    {

    }

    /**
     * @Route("/login/success", name="login_success")
     */
    public function success(Request $request, ClientRegistry $clientRegistry)
    {

    }

    /**
     * @Route("/logout", name="logout", methods={"GET"})
     */
    public function logout()
    {
        $this->addFlash("success", "Vous avez bien été déconnecté.");
    }
}