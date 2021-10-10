<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20211010005000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return "Insert headset in database";
    }

    public function up(Schema $schema): void
    {
        $this->addSql('INSERT INTO headset(name) VALUES '
            . '("HTC Vive"),'
            . '("HTC Vive Pro"),'
            . '("HTC Vive Pro 2"),'
            . '("Oculus Rift"),'
            . '("Oculus Rift S"),'
            . '("Oculus Quest"),'
            . '("Oculus Quest 2"),'
            . '("Valve Index"),'
            . '("WMR - Windows Mixed Reality")');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('TRUNCATE TABLE headset');
    }
}