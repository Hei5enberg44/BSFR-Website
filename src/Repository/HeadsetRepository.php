<?php

namespace App\Repository;

use App\Entity\Headset;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Headset|null find($id, $lockMode = null, $lockVersion = null)
 * @method Headset|null findOneBy(array $criteria, array $orderBy = null)
 * @method Headset[]    findAll()
 * @method Headset[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class HeadsetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Headset::class);
    }

    // /**
    //  * @return Headset[] Returns an array of Headset objects
    //  */
    /*
    public function findByExampleField($value)
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.exampleField = :val')
            ->setParameter('val', $value)
            ->orderBy('h.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
        ;
    }
    */

    /*
    public function findOneBySomeField($value): ?Headset
    {
        return $this->createQueryBuilder('h')
            ->andWhere('h.exampleField = :val')
            ->setParameter('val', $value)
            ->getQuery()
            ->getOneOrNullResult()
        ;
    }
    */
}
