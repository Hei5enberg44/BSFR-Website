<?php

namespace App\Form;

use App\Entity\Headset;
use App\Entity\RunYoutube;
use Doctrine\ORM\EntityRepository;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RunYoutubeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('videoLink', TextType::class, [
                'label' => 'Lien vidéo',
                'attr' => [
                    'placeholder' => 'https://drive.omedan.com/index.php/s/3BEz6o74fowWaMK',
                    'class' => 'w-100'
                ],
                'required' => true
            ])
            ->add('description', TextType::class, [
                'label' => 'Description de la vidéo',
                'attr' => [
                    'class' => 'w-100'
                ],
                'required' => true
            ])
            ->add('scoresaberLink', TextType::class, [
                'label' => 'Profil Scoresaber',
                'attr' => [
                    'placeholder' => 'https://scoresaber.com/u/76561198796531407',
                    'class' => 'w-100'
                ],
                'required' => true
            ])
            ->add('mapLink', TextType::class, [
                'label' => 'Leaderboard de la map',
                'attr' => [
                    'placeholder' => 'https://scoresaber.com/leaderboard/6286',
                    'class' => 'w-100'
                ],
                'required' => true
            ])
            ->add('grip', TextType::class, [
                'label' => 'Votre grip',
                'attr' => [
                    'placeholder' => 'Default grip',
                    'class' => 'w-100'
                ],
                'required' => true
            ])
            ->add('twitchLink', TextType::class, [
                'label' => 'Votre lien Twitch',
                'attr' => [
                    'placeholder' => 'https://twitch.tv/beatsaberfr',
                    'class' => 'w-100'
                ],
                'required' => false
            ])
            ->add('headset', EntityType::class, [
                'label' => 'Votre casque VR',
                'attr' => [
                    'class' => 'w-100'
                ],
                'required' => true,
                'placeholder' => false,
                'class' => Headset::class,
                'query_builder' => function (EntityRepository $er) {
                    return $er->createQueryBuilder('ry')
                        ->orderBy('ry.name', 'ASC');
                },
                'choice_label' => 'name'
            ])
        ;
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => RunYoutube::class,
        ]);
    }
}
