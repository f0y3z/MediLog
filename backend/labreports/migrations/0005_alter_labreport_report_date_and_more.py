from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('labreports', '0004_alter_labreport_visit'),
    ]

    operations = [
        migrations.AlterField(
            model_name='labreport',
            name='report_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='labreport',
            name='test_type',
            field=models.CharField(blank=True, choices=[('Blood Test', 'Blood Test'), ('USG', 'USG'), ('X-Ray', 'X-Ray'), ('ECG', 'ECG'), ('MRI', 'MRI'), ('Other', 'Other')], max_length=50, null=True),
        ),
    ]
