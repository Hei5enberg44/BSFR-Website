<?php

namespace App\Repository;

use App\Entity\RunYoutube;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method RunYoutube|null find($id, $lockMode = null, $lockVersion = null)
 * @method RunYoutube|null findOneBy(array $criteria, array $orderBy = null)
 * @method RunYoutube[]    findAll()
 * @method RunYoutube[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class RunYoutubeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, RunYoutube::class);
    }

    // /**
    //  * @return RunYoutube[] Returns an array of RunYoutube objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('r.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?RunYoutube
    {
        return $this->createQueryBuilder('r')
            ->andWhere('r.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
