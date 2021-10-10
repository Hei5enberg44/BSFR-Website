<?php

namespace App\Entity;

use App\Repository\RunYoutubeRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=RunYoutubeRepository::class)
 */
class RunYoutube
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\ManyToOne(targetEntity=User::class, inversedBy="runYoutubes")
     * @ORM\JoinColumn(nullable=false)
     */
    private $user;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $videoLink;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $description;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $scoresaberLink;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $mapLink;

    /**
     * @ORM\ManyToOne(targetEntity=Headset::class, inversedBy="runYoutubes")
     * @ORM\JoinColumn(nullable=false)
     */
    private $headset;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $grip;

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $twitchLink;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): self
    {
        $this->user = $user;

        return $this;
    }

    public function getVideoLink(): ?string
    {
        return $this->videoLink;
    }

    public function setVideoLink(string $videoLink): self
    {
        $this->videoLink = $videoLink;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(string $description): self
    {
        $this->description = $description;

        return $this;
    }

    public function getScoresaberLink(): ?string
    {
        return $this->scoresaberLink;
    }

    public function setScoresaberLink(string $scoresaberLink): self
    {
        $this->scoresaberLink = $scoresaberLink;

        return $this;
    }

    public function getMapLink(): ?string
    {
        return $this->mapLink;
    }

    public function setMapLink(string $mapLink): self
    {
        $this->mapLink = $mapLink;

        return $this;
    }

    public function getHeadset(): ?Headset
    {
        return $this->headset;
    }

    public function setHeadset(?Headset $headset): self
    {
        $this->headset = $headset;

        return $this;
    }

    public function getGrip(): ?string
    {
        return $this->grip;
    }

    public function setGrip(string $grip): self
    {
        $this->grip = $grip;

        return $this;
    }

    public function getTwitchLink(): ?string
    {
        return $this->twitchLink;
    }

    public function setTwitchLink(?string $twitchLink): self
    {
        $this->twitchLink = $twitchLink;

        return $this;
    }
}
