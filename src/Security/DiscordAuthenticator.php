<?php

namespace App\Security;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use KnpU\OAuth2ClientBundle\Client\ClientRegistry;
use KnpU\OAuth2ClientBundle\Security\Authenticator\OAuth2Authenticator;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\Flash\FlashBagInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\PassportInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class DiscordAuthenticator extends OAuth2Authenticator
{
    private ClientRegistry $clientRegistry;
    private EntityManagerInterface $em;
    private RouterInterface $router;
    private FlashBagInterface $flash;

    public function __construct(ClientRegistry $clientRegistry, EntityManagerInterface $entityManager, RouterInterface $router, FlashBagInterface $flash)
    {
        $this->clientRegistry = $clientRegistry;
        $this->em = $entityManager;
        $this->router = $router;
        $this->flash = $flash;
    }

    public function supports(Request $request): ?bool
    {
        // continue ONLY if the current ROUTE matches the check ROUTE
        return $request->attributes->get('_route') === 'login_check';
    }

    public function authenticate(Request $request): PassportInterface
    {
        $client = $this->clientRegistry->getClient('discord_main');
        $accessToken = $this->fetchAccessToken($client);

        return new SelfValidatingPassport(
            new UserBadge($accessToken->getToken(), function() use ($accessToken, $client) {
                $discordUser = $client->fetchUserFromToken($accessToken);

                $user = $this->em->getRepository(User::class)->findOneBy(['discordId' => $discordUser->getId()]);

                if (!$user) {
                    $user = new User();

                    $user->setRoles([])
                        ->setIsBan(0);
                }

                if($discordUser->getAvatarHash() === null) {
                    $avatarLink = "https://cdn.discordapp.com/embed/avatars/0.png";
                } else {
                    $avatarLink = "https://cdn.discordapp.com/avatars/" . $discordUser->getId() . "/"  . $discordUser->getAvatarHash();

                    if(strpos($discordUser->getAvatarHash(), 'a_') !== false) {
                        $avatarLink .= ".gif";
                    } else {
                        $avatarLink .= ".png";
                    }
                }

                $user->setDiscordId($discordUser->getId())
                    ->setDiscordAvatar($avatarLink)
                    ->setDiscordName($discordUser->getUsername())
                    ->setDiscordDiscriminator($discordUser->getDiscriminator());

                $this->em->persist($user);
                $this->em->flush();

                return $user;
            })
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $this->flash->add("success", "test.");
        return new RedirectResponse($this->getPreviousUrl($request, "main") ?? $this->router->generate("home"));
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        $message = strtr($exception->getMessageKey(), $exception->getMessageData());

        $this->flash->add("error", "Une erreur est survenue lors de l'authentification.");

        return new RedirectResponse($this->router->generate("home"));
    }
}