<?php

namespace App\Entity;

use App\Repository\HeadsetRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass=HeadsetRepository::class)
 */
class Headset
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private $name;

    /**
     * @ORM\OneToMany(targetEntity=RunYoutube::class, mappedBy="headset")
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

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

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
            $runYoutube->setHeadset($this);
        }

        return $this;
    }

    public function removeRunYoutube(RunYoutube $runYoutube): self
    {
        if ($this->runYoutubes->removeElement($runYoutube)) {
            // set the owning side to null (unless already changed)
            if ($runYoutube->getHeadset() === $this) {
                $runYoutube->setHeadset(null);
            }
        }

        return $this;
    }
}
