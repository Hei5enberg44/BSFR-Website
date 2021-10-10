<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 */
class User implements UserInterface
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="json")
     */
    private $roles = [];

    /**
     * @ORM\Column(type="bigint")
     */
    private $discordId;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $discordName;

    /**
     * @ORM\Column(type="text", nullable=true)
     */
    private $discordAvatar;

    /**
     * @ORM\Column(type="integer")
     */
    private $discordDiscriminator;

    /**
     * @ORM\Column(type="boolean", nullable=true)
     */
    private $isBan;

    /**
     * @ORM\OneToMany(targetEntity=RunYoutube::class, mappedBy="user", orphanRemoval=true)
     */
    private $runYoutubes;

    public function __construct()
    {
        $this->runYoutubes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @deprecated since Symfony 5.3, use getUserIdentifier instead
     */
    public function getUsername(): string
    {
        return (string) $this->discordName . "#" . $this->discordDiscriminator;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return (string) $this->discordName . "#" . $this->discordDiscriminator;
    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    /**
     * This method can be removed in Symfony 6.0 - is not needed for apps that do not check user passwords.
     *
     * @see PasswordAuthenticatedUserInterface
     */
    public function getPassword(): ?string
    {
        return null;
    }

    /**
     * This method can be removed in Symfony 6.0 - is not needed for apps that do not check user passwords.
     *
     * @see UserInterface
     */
    public function getSalt(): ?string
    {
        return null;
    }

    /**
     * @see UserInterface
     */
    public function eraseCredentials()
    {
        // If you store any temporary, sensitive data on the user, clear it here
        // $this->plainPassword = null;
    }

    public function getDiscordId(): ?string
    {
        return $this->discordId;
    }

    public function setDiscordId(string $discordId): self
    {
        $this->discordId = $discordId;

        return $this;
    }

    public function getDiscordName(): ?string
    {
        return $this->discordName;
    }

    public function setDiscordName(string $discordName): self
    {
        $this->discordName = $discordName;

        return $this;
    }

    public function getDiscordAvatar(): ?string
    {
        return $this->discordAvatar;
    }

    public function setDiscordAvatar(?string $discordAvatar): self
    {
        $this->discordAvatar = $discordAvatar;

        return $this;
    }

    public function getDiscordDiscriminator(): ?int
    {
        return $this->discordDiscriminator;
    }

    public function setDiscordDiscriminator(int $discordDiscriminator): self
    {
        $this->discordDiscriminator = $discordDiscriminator;

        return $this;
    }

    public function getIsBan(): ?bool
    {
        return $this->isBan;
    }

    public function setIsBan(?bool $isBan): self
    {
        $this->isBan = $isBan;

        return $this;
    }

    /**
     * @return Collection|RunYoutube[]
     */
    public function getRunYoutubes(): Collection
    {
        return $this->runYoutubes;
    }

    public function addRunYoutube(RunYoutube $runYoutube): self
    {
        if (!$this->runYoutubes->contains($runYoutube)) {
            $this->runYoutubes[] = $runYoutube;
            $runYoutube->setUser($this);
        }

        return $this;
    }

    public function removeRunYoutube(RunYoutube $runYoutube): self
    {
        if ($this->runYoutubes->removeElement($runYoutube)) {
            // set the owning side to null (unless already changed)
            if ($runYoutube->getUser() === $this) {
                $runYoutube->setUser(null);
            }
        }

        return $this;
    }
}
