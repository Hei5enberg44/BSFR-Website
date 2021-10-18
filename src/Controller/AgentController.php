<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * @Route("/agent", name="agent")
 */
class AgentController extends AbstractController
{
    /**
     * @Route("/google/redirect", name="_google_redirect")
     */
    public function googleRedirect(Request $request): Response
    {
        return $this->render('agent/google/redirect.html.twig', [
            "code" => $request->query->get("code")
        ]);
    }
}
